"""
ml-service/app/class_mapping.py

WHY THIS FILE EXISTS
---------------------
`yolo11s-cls.pt` (the pretrained base model) has never been fine-tuned on
our waste dataset - MODEL_PATH is still pointing at the generic ImageNet-1k
classifier because `best.pt` does not exist yet (see scripts/train-waste-model.py
and dataset/README.md for how to produce it).

The pretrained model therefore only knows ImageNet-1k's 1000 generic
classes (e.g. "water bottle", "pop bottle", "carton"), never our waste
taxonomy (e.g. "plastic_bottle", "cardboard"). Without this file, every
prediction falls through the knowledge base lookup in
src/lib/waste/wasteKnowledgeBase.js and shows "Material: Unknown,
Recyclable: No" - which is what was observed in testing.

This is NOT a hack that hardcodes predictions. The model still makes its
own real prediction from the real pixels; this module only translates the
model's ALREADY-VERIFIED output vocabulary into our knowledge base's
vocabulary, exactly the way `model = visual identification`,
`knowledge base = material facts` is supposed to work. If the model
predicts something outside this map, it is left untouched and will
honestly show as "Unknown" rather than being force-fit into a category.

SOURCE OF THE MAPPING
----------------------
The exact label strings below were extracted directly from the installed
`ultralytics` package's own ImageNet-1k class list
(ultralytics/cfg/datasets/ImageNet.yaml, "simplified labels" per
https://github.com/anishathalye/imagenet-simple-labels) - NOT assumed or
guessed. Confirmed present in that 1000-class list (index shown for
reference):
    440 beer bottle        478 carton            653 milk can
    620 laptop computer    664 monitor            700 paper towel
    720 pill bottle        728 plastic bag        737 soda bottle
    761 remote control     898 water bottle       899 water jug
    901 whiskey jug        907 wine bottle        999 toilet paper
    487 mobile phone       508 computer keyboard  527 desktop computer
    592 hard disk drive    605 iPod               662 modem
    673 computer mouse     742 printer            485 CD player
    482 cassette player    528 rotary dial telephone

DISCLOSED GAPS (do not silently paper over these - see README notes)
-----------------------------------------------------------------------
ImageNet-1k has NO class that reliably corresponds to:
  - a soda/aluminium can ("milk can" exists but depicts a large dairy
    churn, not a beverage can - mapped to the broader "metal" category
    only, never to "aluminium_can", to avoid overclaiming precision)
  - plain paper / a sheet of paper (only "carton", "paper towel", and
    "toilet paper" exist)
  - food waste (mapping arbitrary food-item classes like "banana" would
    be guessing what state the food is in - not done)
These gaps are real limitations of the PRETRAINED model's vocabulary and
are the strongest argument for fine-tuning on the project's own dataset
(see scripts/train-waste-model.py) rather than relying on this bridge
long-term.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ClassMapping:
    waste_class_id: str
    # "high": near-unambiguous semantic match (e.g. "water bottle" -> plastic bottle)
    # "approximate": plausible but imprecise match (e.g. "whiskey jug" -> glass bottle)
    confidence_tier: str


# Keys are the EXACT simplified ImageNet-1k labels as they appear in
# ultralytics/cfg/datasets/ImageNet.yaml (space-separated, lowercase).
# Values map to the classIds used in src/lib/waste/wasteCategories.js.
IMAGENET_TO_WASTE_CLASS: dict[str, ClassMapping] = {
    # --- Plastic bottle family (high confidence) ---
    "water bottle": ClassMapping("plastic_bottle", "high"),
    "soda bottle": ClassMapping("plastic_bottle", "high"),
    "pill bottle": ClassMapping("plastic_bottle", "high"),
    # --- Glass bottle family ---
    "beer bottle": ClassMapping("glass_bottle", "high"),
    "wine bottle": ClassMapping("glass_bottle", "high"),
    "whiskey jug": ClassMapping("glass_bottle", "approximate"),
    # --- Plastic bag (exact ImageNet class exists) ---
    "plastic bag": ClassMapping("plastic_bag", "high"),
    # --- Cardboard ---
    "carton": ClassMapping("cardboard", "high"),
    # --- Tissue / soft paper ---
    "paper towel": ClassMapping("tissue", "high"),
    "toilet paper": ClassMapping("tissue", "high"),
    # --- Metal (approximate - see disclosed gap above re: no "can" class) ---
    "milk can": ClassMapping("metal", "approximate"),
    # --- E-waste (electronics) ---
    "mobile phone": ClassMapping("e_waste", "high"),
    "rotary dial telephone": ClassMapping("e_waste", "high"),
    "laptop computer": ClassMapping("e_waste", "high"),
    "desktop computer": ClassMapping("e_waste", "high"),
    "monitor": ClassMapping("e_waste", "high"),
    "computer keyboard": ClassMapping("e_waste", "high"),
    "computer mouse": ClassMapping("e_waste", "high"),
    "hard disk drive": ClassMapping("e_waste", "high"),
    "remote control": ClassMapping("e_waste", "high"),
    "modem": ClassMapping("e_waste", "high"),
    "printer": ClassMapping("e_waste", "high"),
    "cd player": ClassMapping("e_waste", "approximate"),
    "cassette player": ClassMapping("e_waste", "approximate"),
    "ipod": ClassMapping("e_waste", "approximate"),
}

# Confidence multiplier applied to "approximate" tier matches so the UI's
# confidence score reflects the added uncertainty of the vocabulary bridge
# itself, on top of the model's own uncertainty. High-tier matches are
# passed through unchanged.
APPROXIMATE_TIER_CONFIDENCE_PENALTY = 0.9


def resolve_waste_class(raw_label: str) -> tuple[str, float] | None:
    """
    Look up a raw (pretrained-model) ImageNet label and return
    (waste_class_id, confidence_multiplier), or None if there is no
    reliable mapping - in which case the caller should leave the raw
    label untouched (honest "unknown" rather than a forced guess).
    """
    key = raw_label.strip().lower()
    mapping = IMAGENET_TO_WASTE_CLASS.get(key)
    if mapping is None:
        return None

    multiplier = (
        APPROXIMATE_TIER_CONFIDENCE_PENALTY if mapping.confidence_tier == "approximate" else 1.0
    )
    return mapping.waste_class_id, multiplier

# SmartWaste Dataset

This folder holds the training images used to fine-tune YOLO11s-cls (see
`scripts/train-waste-model.py`). Images are **not** committed here - only
this structure/documentation.

## ⚠️ Dataset source investigation (read before collecting images)

The Roboflow dataset initially proposed for this project -
[`garbage-detection-oa9nh/yolov5-garbage-detection` v1 (2023-09-22)](https://universe.roboflow.com/garbage-detection-oa9nh/yolov5-garbage-detection/dataset/1)
- was inspected via its public listing. **It contains exactly 2 classes:
`trash` and `not trash`.** It is a binary trash-presence *detector*
(bounding boxes only), not a material classifier, and its labels cannot
be relabeled into `plastic_bottle` / `aluminium_can` / etc. without
fabricating ground truth. **Do not use this dataset for this project's
classification task.**

A better-suited public starting point is the **TrashNet** dataset
(Thung & Yang) - ~2,527 images across `glass`, `paper`, `cardboard`,
`plastic`, `metal`, `trash`. It still does not cover every target class
(no separate `aluminium_can`, `tissue`, `food_waste`, `plastic_bag`, or
`e_waste` classes), so it should be treated as a partial starting point,
supplemented with your own photographed/curated images for the missing
classes - not used as-is and not stretched to cover classes it doesn't
contain.

**Whatever dataset you use, verify its actual class list yourself before
training** (open its `data.yaml` / class list, don't assume from the
dataset's name or description) - the same investigation done above for
the Roboflow dataset should be repeated for any new source.

## Expected layout

```text
dataset/
├── train/
│   ├── aluminium_can/
│   │   ├── img001.jpg
│   │   └── ...
│   ├── plastic_bottle/
│   ├── glass_bottle/
│   ├── paper/
│   ├── cardboard/
│   ├── tissue/
│   ├── food_waste/
│   ├── plastic_bag/
│   ├── e_waste/
│   └── metal/
│
├── val/
│   ├── aluminium_can/
│   ├── plastic_bottle/
│   └── ... (same class folders as train/)
│
└── test/
    ├── aluminium_can/
    ├── plastic_bottle/
    └── ... (same class folders as train/)
```

Class folder names **must** match the `classId` values in
`src/lib/waste/wasteCategories.js` (lowercase, underscore-separated) so
predictions map correctly to display names and knowledge-base entries in
the Next.js app.

## Guidelines

- Aim for at least 100-200 images per class for a usable fine-tune; more
  is better, especially with varied backgrounds, lighting, and angles.
- Keep `train` / `val` / `test` splits non-overlapping (e.g. roughly
  70/20/10).
- Images can be `.jpg`, `.jpeg`, or `.png`.
- **Check for duplicate/near-duplicate images across splits** before
  training (e.g. `scripts/train-waste-model.py --check-leakage`, or a
  perceptual-hash dedupe pass) - the same photo appearing in both
  `train/` and `test/` will inflate reported accuracy without the model
  actually generalizing.

## Adding a new category

1. Create `dataset/train/<new_class>/`, `dataset/val/<new_class>/`, and
   optionally `dataset/test/<new_class>/` with images.
2. Add a matching entry to `src/lib/waste/wasteCategories.js` and
   `src/lib/waste/wasteKnowledgeBase.js` (and `wasteSafetyRules.js` if the
   category is hazardous).
3. Re-run `scripts/train-waste-model.py` to produce an updated `best.pt`.

## Interim fix while no fine-tuned model exists

Until a properly fine-tuned `best.pt` is trained on real labeled data,
`ml-service/app/class_mapping.py` bridges a subset of the **pretrained**
`yolo11s-cls.pt` model's real ImageNet-1k vocabulary (e.g. "water bottle",
"pop bottle", "carton") to this project's waste classIds, so common items
like plastic/glass bottles, cardboard, and tissue resolve correctly
against the knowledge base today. It explicitly does NOT cover
`aluminium_can` or `food_waste` (no reliable ImageNet-1k equivalent
exists for either) - those will continue to show "Unknown" until real
training data is collected for them. See that file's docstring for the
full, disclosed list of what is and isn't covered.


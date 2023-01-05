const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

// Gets all categories and includes associalted products
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({ include: Product });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Finds a single category by id and includes associated product data
// If a category isn't found based on the id included in the request, 404 will be returned
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, { include: Product });
    if (!category) {
      res.status(404).json({ message: "No category found for this id" });
    } else {
      res.status(200).json(category);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new category
//  Example JSON body for request:
// {
//   "category_name": "New Category"
// }
router.post("/", async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a category by id
// If a category isn't found based on the id included in the request, 404 will be returned
// JSON body should look the same as what is included for the post route
router.put("/:id", async (req, res) => {
  try {
    const categoryData = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!categoryData[0]) {
      res.status(404).json({ message: "No category found for this id" });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a category by id
// If a category isn't found based on the id included in the request, 404 will be returned
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (deletedCategory) {
      res.status(200).json(deletedCategory);
    } else {
      res.status(404).json({ message: "No category found with this id" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// Gets all tags and includes associated product data
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll({ include: Product });
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Finds a single tag by id and includes associated product data
router.get("/:id", async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, { include: Product });
    if (!tag) {
      res.status(404).json({ message: "No tag found for this id" });
    } else {
      res.status(200).json(tag);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new tag
//  Example JSON body for request:
// {
// 	"tag_name": "New Tag"
// }
router.post("/", async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a tag's name by its id
// If a tag isn't found based on the id included in the request, 404 will be returned
// JSON body should look the same as what is included for the post route
router.put("/:id", async (req, res) => {
  try {
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!tagData[0]) {
      res.status(404).json({ message: "No tag found for this id" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a tag by its id value
// If a tag isn't found based on the id included in the request, 404 will be returned
router.delete("/:id", async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (deletedTag) {
      res.status(200).json(deletedTag);
    } else {
      res.status(404).json({ message: "No tag found with this id" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

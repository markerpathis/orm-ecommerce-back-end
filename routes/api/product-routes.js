const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// Gets all products and includes associated categories and tags
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({ include: [{ model: Category }, { model: Tag }] });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Finds a single product by id and includes associated categories and tags
// If a product isn't found based on the id included in the request, 404 will be returned
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [{ model: Category }, { model: Tag }] });
    if (!product) {
      res.status(404).json({ message: "No product found for this id" });
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create new product
//  Example JSON body for request:
// {
// 	"product_name": "New Product",
// 	"price": 250.00,
// 	"stock": 5,
// 	"category_id": 1,
// 	"tagIds": [1, 2, 3, 4]
// }
router.post("/", (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// Update product
// JSON body should look the same as what is included for the post route
router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags.filter(({ tag_id }) => !req.body.tagIds.includes(tag_id)).map(({ id }) => id);

      // run both actions
      return Promise.all([ProductTag.destroy({ where: { id: productTagsToRemove } }), ProductTag.bulkCreate(newProductTags)]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its id value
// If a product isn't found based on the id included in the request, 404 will be returned
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (deletedProduct) {
      res.status(200).json(deletedProduct);
    } else {
      res.status(404).json({ message: "No product found with this id" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

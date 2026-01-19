/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json814371037",
    "maxSize": 0,
    "name": "assignments",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // remove field
  collection.fields.removeById("json814371037")

  return app.save(collection)
})

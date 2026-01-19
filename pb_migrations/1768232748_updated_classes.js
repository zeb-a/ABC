/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json3900794100",
    "maxSize": 0,
    "name": "student_submissions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // remove field
  collection.fields.removeById("json3900794100")

  return app.save(collection)
})

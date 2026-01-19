/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638429044")

  // remove field
  collection.fields.removeById("json3900794100")

  // remove field
  collection.fields.removeById("json1063348727")

  return app.save(collection)
}, (app) => {
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

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json1063348727",
    "maxSize": 0,
    "name": "submissions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})

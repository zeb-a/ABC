/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_638429044",
    "hidden": false,
    "id": "relation3925871376",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "class_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3415494426",
    "max": null,
    "min": null,
    "name": "student_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1627391454",
    "max": 0,
    "min": 0,
    "name": "student_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3516072696",
    "max": 0,
    "min": 0,
    "name": "assignment_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3537150409",
    "max": 0,
    "min": 0,
    "name": "assignment_title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json1355859462",
    "maxSize": 0,
    "name": "answers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "submitted"
    ]
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json59883123",
    "maxSize": 0,
    "name": "grade_data",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // remove field
  collection.fields.removeById("relation3925871376")

  // remove field
  collection.fields.removeById("number3415494426")

  // remove field
  collection.fields.removeById("text1627391454")

  // remove field
  collection.fields.removeById("text3516072696")

  // remove field
  collection.fields.removeById("text3537150409")

  // remove field
  collection.fields.removeById("json1355859462")

  // remove field
  collection.fields.removeById("select2063623452")

  // remove field
  collection.fields.removeById("json59883123")

  return app.save(collection)
})

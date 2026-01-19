/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // update collection data
  unmarshal({
    "deleteRule": "class_id.teacher = @request.auth.id",
    "listRule": "class_id.teacher = @request.auth.id",
    "updateRule": "class_id.teacher = @request.auth.id",
    "viewRule": "class_id.teacher = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // update collection data
  unmarshal({
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})

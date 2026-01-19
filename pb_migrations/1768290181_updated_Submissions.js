/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // update collection data
  unmarshal({
    "name": "submissions"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1225573716")

  // update collection data
  unmarshal({
    "name": "Submissions"
  }, collection)

  return app.save(collection)
})

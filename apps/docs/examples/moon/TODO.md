# Physics on the planet

- Needs to probably generated via a trimesh
- Probably we want to limit the amount of rigid bodies / colliders, therefore we should render only
  rigid bodies on higher level-of-detail chunks
- We need to eliminate the Skirts of the terrain chunks as these will probably not be useful.
- Investigate whether or not use other Collider types (heightmap)
  - heightmap has to be distorted towrds the center of the planet
  - heightmap up direction will change for each chunk to be the vector pointing outwards of the center of the planet

// This fixture covers Mapeo GeoJSON export data that was processed by frizzle and is stored in a GuardianConnector data warehouse

export const mapeoData = [
  {
    id: "a1b2c3d4e5f67890",
    g__coordinates: "",
    g__type: "Point",
    p___created: "2024-03-09T16:28:23.780Z",
    p___modified: "2024-03-09T16:28:23.780Z",
    p___photos:
      "['b1c2d3e4f5a67890.jpg', 'c3d4e5f6a7b89012.jpg', 'd5e6f7a8b9c01234.jpg', 'e7f8a9b0c1d23456.jpg', 'f9a0b1c2d3e45678.jpg']",
    p___version:
      "b1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890@113",
    p__activity: "",
    p__aeroway: "",
    p__boundary: "",
    p__building: "",
    p__building_type: "",
    p__categoryid: "house",
    p__cultural: "",
    p__highway: "",
    p__impact: "",
    p__landuse: "",
    p__name: "",
    p__natural: "",
    p__notes: "Note 1",
    p__nuevo: "yes",
    p__owner: "",
    p__place: "",
    p__tree: "",
    p__type: "",
    p__water: "",
    p__waterway: "",
  },
  {
    id: "f0e1d2c3b4a56789",
    g__coordinates: "[-4.9876543, 83.1234567]",
    g__type: "Point",
    p___created: "2024-03-09T16:18:43.797Z",
    p___modified: "2024-03-09T16:18:43.797Z",
    p___photos: "",
    p___version:
      "c3d4e5f6a7b89012c3d4e5f6a7b89012c3d4e5f6a7b89012c3d4e5f6a7b89012@112",
    p__activity: "",
    p__aeroway: "",
    p__boundary: "",
    p__building: "",
    p__building_type: "",
    p__categoryid: "lake",
    p__cultural: "",
    p__highway: "",
    p__impact: "",
    p__landuse: "",
    p__name: "",
    p__natural: "",
    p__notes: "Note 2",
    p__nuevo: "yes",
    p__owner: "",
    p__place: "",
    p__tree: "",
    p__type: "",
    p__water: "",
    p__waterway: "",
  },
  {
    id: "e9f8d7c6b5a43210",
    g__coordinates: "[-14.6543210, 89.8765432]",
    g__type: "Point",
    p___created: "2024-03-09T16:17:23.587Z",
    p___modified: "2024-03-09T16:17:23.588Z",
    p___photos: "",
    p___version:
      "d5e6f7a8b9c01234d5e6f7a8b9c01234d5e6f7a8b9c01234d5e6f7a8b9c01234@111",
    p__activity: "",
    p__aeroway: "",
    p__boundary: "",
    p__building: "",
    p__building_type: "",
    p__categoryid: "forest",
    p__cultural: "",
    p__highway: "",
    p__impact: "",
    p__landuse: "",
    p__name: "",
    p__natural: "",
    p__notes: "Note 3",
    p__nuevo: "yes",
    p__owner: "",
    p__place: "",
    p__tree: "",
    p__type: "",
    p__water: "",
    p__waterway: "",
  },
];

export const transformedMapeoData = [
  {
    ID: "A1b2c3d4e5f67890",
    geocoordinates: "",
    geotype: "Point",
    created: "3/9/2024",
    modified: "3/9/2024",
    photos:
      "b1c2d3e4f5a67890.jpg, c3d4e5f6a7b89012.jpg, d5e6f7a8b9c01234.jpg, e7f8a9b0c1d23456.jpg, f9a0b1c2d3e45678.jpg",
    version:
      "B1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890b1c2d3e4f5a67890@113",
    activity: "",
    aeroway: "",
    boundary: "",
    building: "",
    "building type": "",
    category: "House",
    cultural: "",
    highway: "",
    impact: "",
    landuse: "",
    name: "",
    natural: "",
    notes: "Note 1",
    nuevo: "Yes",
    owner: "",
    place: "",
    tree: "",
    type: "",
    water: "",
    waterway: "",
  },
  {
    ID: "F0e1d2c3b4a56789",
    geocoordinates: "[-4.9876543, 83.1234567]",
    geotype: "Point",
    created: "3/9/2024",
    modified: "3/9/2024",
    photos: "",
    version:
      "C3d4e5f6a7b89012c3d4e5f6a7b89012c3d4e5f6a7b89012c3d4e5f6a7b89012@112",
    activity: "",
    aeroway: "",
    boundary: "",
    building: "",
    "building type": "",
    category: "House",
    cultural: "",
    highway: "",
    impact: "",
    landuse: "",
    name: "",
    natural: "",
    notes: "Note 2",
    nuevo: "Yes",
    owner: "",
    place: "",
    tree: "",
    type: "",
    water: "",
    waterway: "",
  },
  {
    ID: "E9f8d7c6b5a43210",
    geocoordinates: "[-14.6543210, 89.8765432]",
    geotype: "Point",
    created: "3/9/2024",
    modified: "3/9/2024",
    photos: "",
    version:
      "D5e6f7a8b9c01234d5e6f7a8b9c01234d5e6f7a8b9c01234d5e6f7a8b9c01234@111",
    activity: "",
    aeroway: "",
    boundary: "",
    building: "",
    "building type": "",
    category: "Forest",
    cultural: "",
    highway: "",
    impact: "",
    landuse: "",
    name: "",
    natural: "",
    notes: "Note 3",
    nuevo: "Yes",
    owner: "",
    place: "",
    tree: "",
    type: "",
    water: "",
    waterway: "",
  },
];

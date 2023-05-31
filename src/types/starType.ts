export interface StarMetaData {
  color: string;
  const_id: string;
  const_name: string;
  dec: string;
  display_name: string;
  filename: string;
  lat: string;
  lon: string;
  name: string;
  prop_name: string;
  ra: string;
  star_id: string;
}

export interface ConstMetaData {
  const_id: string;
  name: string;
  display_name: string;
  color: string;
  lon: string;
  lat: string;
  lines: [string];
  stars: [string];
  filename: string;
}

export interface Document {
  filename: string;
  paragraph: [Paragraph];
}

export interface Paragraph {
  type: string;
  text: string;
}
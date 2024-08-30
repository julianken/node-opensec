export type Legistlator = {
  id: string;
  name: string;
  party: string;
  state: string;
  district: string;
  phone: string;
  office: string;
  link: string;
  image: string;
};

export type Legistlators = {
  response: {
    legislators: {
      legislator: Legistlator[];
    };
  };
};

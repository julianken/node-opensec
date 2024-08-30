export type Legislator = {
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

export type Legislators = {
  response: {
    legislators: {
      legislator: Legislator[];
    };
  };
};

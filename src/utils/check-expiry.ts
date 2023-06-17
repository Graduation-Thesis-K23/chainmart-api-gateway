const checkExpiry = (time: string) => {
  const now = new Date().toISOString();
  const deadline = new Date(time).toISOString();

  return now < deadline;
};

export default checkExpiry;

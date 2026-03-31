export function mongoEnabled() {
  return Boolean(process.env.MONGO_URI);
}

export function configPathLabel() {
  return mongoEnabled() ? "MongoDB configured" : "MongoDB not configured";
}

// Part 3: presentational list of saved snapshots.
// Each entry shows its key / plaintext / ciphertext with Load and Delete actions.
// Keep this component stateless; the parent owns the history array.
export const History = ({ plainText, cipherText, cipherKey, onDelete, onLoad }) => {
  // TODO
  return (
    <section style={{ border: "1px solid grey" }}>
      <div>{plainText}</div>
      <div>{cipherText}</div>
      <div>{cipherKey}</div>
      <button onClick={onDelete}>Delete</button>
      <button onClick={onLoad}>Load</button>
    </section>
  );
};

import { Helper } from "./Helper";
import { useState } from "react";

export const Stripe = () => {
  return (
    <div>
      {[0, 1, 2, 3, 4, 5].map((_, index) => (
        <Message index={index} />
      ))}
    </div>
  );
};

const Message = ({ index }) => {
  return (
    <div style={{ ...styles.container, ...(index % 2 === 0 ? styles.left : styles.right) }}>
      <p
        style={{
          ...styles.message,
          ...(index % 2 === 0 ? styles.leftMessage : styles.rightMessage),
        }}
      >
        helllo there who tehreasdfasdfasdfsafasdfasdfsafasdfasdasdfasdfasdfasdfsa
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
  },
  left: {
    // justifyContent: "start",
  },
  leftMessage: {
    backgroundColor: "grey",
  },
  right: {
    // justifyContent: "end",
    flexDirection: "row-reverse",
  },
  rightMessage: {
    backgroundColor: "blue",
    color: "white",
  },
  message: {
    padding: "8px",
    maxWidth: "60%",
  },
};

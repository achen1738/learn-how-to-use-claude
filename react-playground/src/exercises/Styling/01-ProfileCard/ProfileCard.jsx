import { placeholderImage } from "../shared/placeholder.js";
import "./ProfileCard.css";
import { useState } from "react";
// 01 · Profile Card. The full prompt is in README.md in this folder.
// Write all styles in ProfileCard.css. Prefix classes with "profile-card".

export const USERS = [
  {
    id: "u1",
    name: "Priya Patel",
    title: "Staff Frontend Engineer",
    bio: "Builds design systems and cares a lot about keyboard users.",
    // Wide image: has to be cropped into a circle, not squashed.
    avatar: placeholderImage({ label: "PP", width: 400, height: 240 }),
    online: true,
    blocked: false,
  },
  {
    id: "u2",
    name: "Maximilian Alexander Featherstonehaugh-Worthington",
    title: "Principal Product Designer, Platform Experience",
    bio: "Long name, long title. Make sure the card survives it. Also writes a much longer bio than everyone else, which pushes the buttons further down the card than on the others.",
    // Tall image.
    avatar: placeholderImage({
      label: "MF",
      width: 200,
      height: 420,
      bg: "#fde68a",
      fg: "#78350f",
    }),
    online: false,
    blocked: false,
  },
  {
    id: "u3",
    name: "Sam Lee",
    title: "Engineering Manager",
    bio: "Blocked user: both buttons should be disabled.",
    avatar: placeholderImage({
      label: "SL",
      width: 300,
      height: 300,
      bg: "#bbf7d0",
      fg: "#14532d",
    }),
    online: true,
    blocked: true,
  },
];

export function ProfileCard() {
  // TODO: build the card markup and styles. Track who is followed in state.
  return (
    <div className="container">
      {USERS.map((user) => {
        return <Card key={user.id} {...user} />;
      })}
    </div>
  );
}

const Card = ({ avatar, name, title, bio, online, blocked }) => {
  const [isFollowed, setIsFollowed] = useState(false);

  let buttonClassname = "primary";
  if (isFollowed) {
    buttonClassname = "secondary";
  }

  const handleClick = () => {
    setIsFollowed((prev) => !prev);
  };

  return (
    <div className="cardContainer">
      <div className="contentContainer">
        <div className="imageContainer">
          <img className="image" src={avatar} />
        </div>
        <div className="textContainer">
          <h4 className="title">
            {name} - {title}
          </h4>
          <p className="bio">{bio}</p>
        </div>
      </div>
      <div className="footer">
        <button onClick={handleClick} className={buttonClassname} disabled={blocked}>
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

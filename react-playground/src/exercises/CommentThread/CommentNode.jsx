import { useState } from "react";
import { COMMENTS, CURRENT_USER, NOW, POST } from "./comments.js";

export const CommentNode = ({
  commentIds,
  commentMapping,
  isReplyingId,
  setComments,
  setIsReplyingId,
  childMapping,
  handleDelete,
  hiddenCounts,
}) => {
  const comments = commentIds.map((id) => commentMapping[id]);
  return (
    <ul>
      {comments
        .toSorted((a, b) => {
          if (a.score === b.score) {
            const date1 = new Date(a.createdAt);
            const date2 = new Date(b.createdAt);
            return date2.getTime() - date1.getTime();
          }
          return b.score - a.score;
        })
        .map((comment) => {
          return (
            <Comment
              key={comment.id}
              comment={comment}
              isReplyingId={isReplyingId}
              setIsReplyingId={setIsReplyingId}
              setComments={setComments}
              handleDelete={handleDelete}
              hiddenCounts={hiddenCounts}
              childMapping={childMapping}
              commentMapping={commentMapping}
            />
          );
        })}
    </ul>
  );
};

const Comment = ({
  comment,
  setComments,
  isReplyingId,
  setIsReplyingId,
  handleDelete,
  hiddenCounts,
  childMapping,
  commentMapping,
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const { id, author } = comment;
  const handleHiddenToggle = () => {
    setIsHidden((prev) => !prev);
  };

  return isHidden ? (
    <li>
      <button onClick={handleHiddenToggle}>+</button>
      {hiddenCounts[comment.id]} hidden comments
    </li>
  ) : (
    <li>
      <div>
        <span>
          <button onClick={handleHiddenToggle}>-</button>
          {comment.body || "deleted"}
        </span>
        <span style={{ padding: "4px", borderLeft: "1px solid red" }}>{comment.createdAt}</span>
        <span style={{ padding: "4px", borderLeft: "1px solid red" }}>{comment.score}</span>
        <button onClick={() => setIsReplyingId((prev) => (prev === id ? null : id))}>Reply</button>
        {isReplyingId === id && (
          <Reply comment={comment} setComments={setComments} setIsReplyingId={setIsReplyingId} />
        )}
        {author === CURRENT_USER && <button onClick={() => handleDelete(id)}>Delete</button>}
      </div>
      {Boolean(childMapping[comment.id]) && (
        <CommentNode
          commentIds={childMapping[comment.id]}
          isReplyingId={isReplyingId}
          setIsReplyingId={setIsReplyingId}
          setComments={setComments}
          childMapping={childMapping}
          commentMapping={commentMapping}
          handleDelete={handleDelete}
          hiddenCounts={hiddenCounts}
        />
      )}
    </li>
  );
};

const Reply = ({ comment, setIsReplyingId, setComments }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // 2. Extract data using the native FormData API
    const formData = new FormData(e.currentTarget);
    const reply = formData.get("reply");
    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        parentId: comment.id,
        author: CURRENT_USER,
        body: reply,
        createdAt: new Date().toISOString(),
        score: 1,
        myVote: 1,
        deleted: false,
      },
    ]);
    setIsReplyingId(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
      <textarea name="reply" />
    </form>
  );
};

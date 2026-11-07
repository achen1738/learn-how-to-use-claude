import { useState, useMemo } from "react";
import { COMMENTS, CURRENT_USER, NOW, POST } from "./comments.js";
import { CommentNode } from "./CommentNode.jsx";

// Comment Thread exercise. The full prompt is in README.md in this folder.
function transform(comments) {
  let mapping = {};

  comments.forEach((comment) => {
    mapping[comment.id] = { ...comment, children: [] };
  });

  comments.forEach((comment) => {
    if (comment.parentId && mapping[comment.parentId]) {
      mapping[comment.parentId].children.push(mapping[comment.id]);
    }
  });
  return Object.values(mapping).filter((comment) => !comment.parentId);
}

function pruneDeletedComments(commentMapping, childMapping) {
  const visible = {};
  function visit(parentId) {
    const curr = childMapping[parentId] ?? [];
    const kept = curr.filter((id) => {
      const visibleReplies = visit(id);
      return visibleReplies.length || !commentMapping[id].deleted;
    });

    visible[parentId] = kept.length === curr.length ? curr : kept;
    return visible[parentId];
  }

  visit("root");
  return visible;

  // return comments
  //   .map((comment) => {
  //     const pruned = pruneComments(comment.children);
  //     if (!pruned.length && comment.deleted) {
  //       return undefined;
  //     } else {
  //       return { ...comment, children: pruned };
  //     }
  //   })
  //   .filter(Boolean);
}

const getHiddenCounts = (visibleChildren) => {
  const numChildren = {};
  function visit(parentId) {
    let sum = 0;
    const currChildren = visibleChildren[parentId] ?? [];
    currChildren.forEach((childId) => {
      sum += visit(childId);
    });

    sum += 1;
    numChildren[parentId] = sum;
    return sum;
  }

  visit("root");
  return numChildren;
};

export const CommentThread = () => {
  const [comments, setComments] = useState(COMMENTS);
  const [isReplyingId, setIsReplyingId] = useState(null);
  const commentMapping = useMemo(
    () =>
      comments.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.id]: curr,
        };
      }, {}),
    [comments],
  );

  const childMapping = useMemo(
    () =>
      comments.reduce((acc, curr) => {
        const parentId = curr.parentId ?? "root";
        if (!acc[parentId]) {
          acc[parentId] = [];
        }
        acc[parentId].push(curr.id);
        return acc;
      }, {}),
    [comments],
  );

  const visibleChildren = useMemo(
    () => pruneDeletedComments(commentMapping, childMapping),
    [commentMapping, childMapping],
  );

  const hiddenCounts = useMemo(() => getHiddenCounts(visibleChildren), [visibleChildren]);

  const handleDelete = (id) => {
    setComments((prev) => {
      return prev.map((prevComment) => {
        if (prevComment.id !== id) return prevComment;
        return { ...prevComment, body: null, author: null, deleted: true, myVote: 0 };
      });
    });
  };

  return (
    <div>
      <h2>{POST.title}</h2>
      <p>
        {comments.length} comments · signed in as {CURRENT_USER} · now is {NOW}
      </p>
      <CommentNode
        commentIds={visibleChildren["root"]}
        isReplyingId={isReplyingId}
        setIsReplyingId={setIsReplyingId}
        setComments={setComments}
        commentMapping={commentMapping}
        childMapping={visibleChildren}
        handleDelete={handleDelete}
        hiddenCounts={hiddenCounts}
      />
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase/firebase.util";
import "./style.scss";

const Scoreboard = () => {
  const [scoreboard, setScoreboard] = useState<any>([]);

  useEffect(() => {
    const scoresDB = firestore.collection("scores");

    // TODO make request logic outside
    scoresDB
      .get()
      .then(function (querySnapshot: any) {
        querySnapshot.forEach(function (doc: any) {
          setScoreboard((scoreboard: any) => [...scoreboard, doc.data()]);
        });
      })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }, []);

  return (
    <div className="scoreboard">
      <h2>High scores:</h2>
      <ul>
        {scoreboard
          .sort((a: any, b: any) => a.score - b.score)
          .map((score: any, index: number) => (
            <li key={score.username + index} className="scoreboard__list-item">
              <div className="scoreboard__item-index">{index + 1}</div>
              <div className="scoreboard__item-username">{score.username}</div>
              <div className="scoreboard__item-score">{score.score}</div>
              <div className="scoreboard__item-attempts">
                {score.attemptsUsed}
              </div>
              <div className="scoreboard__item-company">{score.company}</div>
              <div className="scoreboard__item-comment">{score.comment}</div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
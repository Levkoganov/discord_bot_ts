import { User } from "discord.js";
import playerScore_sh from "../models/playerScore_sh";

export default async (
  winner: User,
  loser: User,
  isLoser?: boolean
): Promise<number> => {
  const { id: wId } = winner;
  const { id: lId } = loser;

  const winnerData = await playerScore_sh.findById(wId);
  const loserData = await playerScore_sh.findById(lId);

  const minScore = -12; // Min Remainder Points
  const HighScore = 12; // High Remainder Points
  const maxScore = 112; // Max Remainder Points

  // Points variables
  let startPoints = 100;
  let smallPoints = 1;
  let regularPoints = 3;
  let bigPoints = 5;

  // Invert numbers
  if (isLoser === true) {
    smallPoints = -Math.abs(smallPoints);
    regularPoints = -Math.abs(regularPoints) + 1;
    bigPoints = -Math.abs(bigPoints) + 2;
  }

  if (!winnerData && !loserData) {
    startPoints += regularPoints;
    return startPoints;
  }

  if (winnerData && !loserData) {
    switch (true) {
      // Regular Points (winner has less than 112 points)
      case winnerData.score < HighScore + startPoints:
        if (isLoser) startPoints += regularPoints;
        else startPoints = regularPoints;
        break;

      // Small Points (winner has 112 or more points)
      case winnerData.score >= HighScore + startPoints:
        if (isLoser) startPoints += smallPoints;
        else startPoints = smallPoints;
        break;

      default:
        startPoints = 0;
        break;
    }

    return startPoints;
  }

  if (!winnerData && loserData) {
    switch (true) {
      // Regular Points (loser has between 0 ~ 111 points)
      case loserData.score >= 0 && loserData.score < maxScore:
        if (isLoser) startPoints = regularPoints;
        else startPoints += regularPoints;
        break;

      // Big Points (loser has more than 112 points)
      case loserData.score >= maxScore:
        if (isLoser) startPoints = bigPoints;
        else startPoints += bigPoints;
        break;

      // Unexpected result
      default:
        startPoints = 0;
        console.log("loserData: something went wrong..");
        break;
    }

    if (isLoser) {
      return calLoserScore(loserData.score, startPoints);
    }
    return startPoints;
  }

  if (winnerData && loserData) {
    let resultRemainder = winnerData.score - loserData.score;

    switch (true) {
      // Big Points (Reminder less than or equal -12)
      case resultRemainder <= minScore:
        startPoints = bigPoints;
        break;

      // Regular Points (Reminder is between -11 and 11)
      case resultRemainder > minScore && resultRemainder < HighScore:
        startPoints = regularPoints;
        break;

      // Small Points (Reminder is higher than 12)
      case resultRemainder >= HighScore:
        startPoints = smallPoints;
        break;

      // Unexpected result
      default:
        startPoints = 0;
        break;
    }

    if (isLoser) {
      return calLoserScore(loserData.score, startPoints);
    }
    return startPoints;
  }

  return 0;
};

function calLoserScore(loserScore: number, startPoints: number): number {
  const scoreSummary: number = loserScore + startPoints;

  if (loserScore === 0) return 0; // if loser score is 0 return 0
  else if (scoreSummary === -1)
    return scoreSummary; // check if loser score will be less than 0
  else if (scoreSummary >= 0)
    return startPoints; // return calcualted loser score
  else return 0; // unexpected result
}

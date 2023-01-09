import moment from "moment";
import { IUserCooldownTimer } from "../../types";

export function cooldownTimer(
  createdAt: string,
  userCooldownTimer: IUserCooldownTimer,
  currentLocalTime: string,
  hours: number
): IUserCooldownTimer {
  const timePassed = timePassedInHours(currentLocalTime, createdAt);

  if (timePassed >= hours) {
    return userCooldownTimer;
  } else {
    userCooldownTimer["cooldown"] = timeLeft(currentLocalTime, createdAt);
    userCooldownTimer["isBlocked"] = true;
    return userCooldownTimer;
  }
}
function timePassedInHours(currentTime: string, createdAt: string): number {
  const currTime = moment(currentTime);
  const created = moment(createdAt);
  return currTime.diff(created, "hours");
}

function timeLeft(currentTime: string, createdAt: string): string {
  const currTime = moment(currentTime);
  const created = moment(createdAt);

  return moment
    .utc(moment(currTime, "HH:mm:ss").diff(moment(created, "HH:mm:ss")))
    .format("HH:mm:ss");
}

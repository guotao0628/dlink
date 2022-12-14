import {getData} from "@/components/Common/crud";

export function getStatusCount() {
  return getData("api/jobInstance/getStatusCount");
}

export function getJobInfoDetail(id: number) {
  return getData("api/jobInstance/getJobInfoDetail", {id});
}

export function refreshJobInfoDetail(id: number) {
  return getData("api/jobInstance/refreshJobInfoDetail", {id});
}

export function getLineage(id: number) {
  return getData("api/jobInstance/getLineage", {id});
}

export function getJobManagerInfo(address: string) {
  return getData("api/jobInstance/getJobManagerInfo", {address});
}

export function getTaskManagerInfo(address: string) {
  return getData("api/jobInstance/getTaskManagerInfo", {address});
}

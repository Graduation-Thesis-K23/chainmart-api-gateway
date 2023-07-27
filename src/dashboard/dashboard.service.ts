import { Injectable } from "@nestjs/common";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";

@Injectable()
export class DashboardService {
  getDashboardDataAdmin(getDashboardDataDto: GetDashboardDataDto) {
    console.log(getDashboardDataDto);
    return [
      {
        name: "Branch 1",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 2",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 3",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 4",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 5",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 6",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 7",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 8",
        value: Math.floor(Math.random() * 1000),
      },
    ];
  }

  getDashboardDataBranch(getDashboardDataDto: GetDashboardDataDto) {
    console.log(getDashboardDataDto);
    return [
      {
        name: "Branch 1",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 2",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 3",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 4",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 5",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 6",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 7",
        value: Math.floor(Math.random() * 1000),
      },
      {
        name: "Branch 8",
        value: Math.floor(Math.random() * 1000),
      },
    ];
  }
}

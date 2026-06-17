export interface ReportRequestDTO {
  reportedUserId: string;
  reason: string;
}

export interface BlockRequestDTO {
  userIdToBlock: string;
}

export interface ReportResponseDTO {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: string;
  createdAt: string;
}

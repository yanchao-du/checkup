"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionQueryDto = exports.UpdateSubmissionDto = exports.CreateSubmissionDto = void 0;
class CreateSubmissionDto {
    examType;
    patientName;
    patientNric;
    patientDateOfBirth;
    formData;
    routeForApproval;
}
exports.CreateSubmissionDto = CreateSubmissionDto;
class UpdateSubmissionDto {
    patientName;
    patientNric;
    patientDateOfBirth;
    formData;
}
exports.UpdateSubmissionDto = UpdateSubmissionDto;
class SubmissionQueryDto {
    status;
    examType;
    patientName;
    patientNric;
    fromDate;
    toDate;
    page;
    limit;
}
exports.SubmissionQueryDto = SubmissionQueryDto;
//# sourceMappingURL=submission.dto.js.map
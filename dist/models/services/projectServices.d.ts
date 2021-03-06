import { Contributors, Project, TaskStatus } from '../models/serviceValues';
export declare class ProjectS {
    static getProject(projectId: any): Promise<{}>;
    static getMyProjectsIds(userId: any): Promise<{}>;
    static getMyProjects(userId: any, offset?: number, limit?: number, nameCriteria?: string): Promise<Project[]>;
    static searchProjects(userId: any, offset?: number, limit?: number, nameCriteria?: string): Promise<Project[]>;
    static getContributors(projectId: number, offset?: number, limit?: number): Promise<Contributors>;
    static getTaskSets(userId: number, projectId: any, offset?: number, limit?: number): Promise<{}>;
    static getTasks(setId: any, offset?: number, limit?: number): Promise<{}>;
    static newProject(projectData: any): Promise<{}>;
    static addContributors(projectId: number, contributorIds: any): Promise<[any, any]>;
    static removeContributors(projectId: number, contributorIds: any): Promise<[any, any]>;
    static addIndividualContributor(memberId: any, projectId: any): any;
    static replyIndividualContributorJoinRequest(requestId: any, decision: any): any;
    static addTeamContributor(teamId: any, projectId: any): any;
    static replyTeamContributorJoinRequest(requestId: any, decision: any): any;
    static updateProjectLogo(projectId: any, imageUrl: string): any;
    static editProjectDetails(projectId: number, projectData: any): any;
    static deleteProject(projectId: number): any;
    static newSet(userId: number, setData: any): any;
    static removeSet(setId: any): any;
    static setSetCompleted(setId: any): any;
    static newTask(taskData: any): any;
    static removeTask(taskId: any): any;
    static startTask(taskId: any): any;
    static completeTask(taskId: any): any;
    static changeTaskStatus(taskId: any, status: TaskStatus): any;
    static getUnseenTasks(userId: any): Promise<{}>;
    static getUnseenTeamContributorJoinRequest(userId: any): Promise<{}>;
    static getUnseenIndividualContributorJoinRequest(userId: any): Promise<{}>;
    static getNextTasksetNumber(projectId: number): Promise<number>;
    static getNextTaskNumber(projectId: number, tasksetId: number): Promise<number>;
    static checkProjectLeadership(userId: number, projectId: number): Promise<boolean>;
    static checkContributor(userId: number, projectId: number): Promise<boolean>;
    static checkTeamContributor(teamId: number, projectId: number): Promise<{}>;
    static checkIndividualContributorRequestReceiever(userId: number, requestId: number): Promise<boolean>;
    static checkTeamContributorRequestReceiever(userId: number, requestId: number): Promise<boolean>;
    static checkTaskAssignee(userId: number, taskId: number): Promise<boolean>;
}

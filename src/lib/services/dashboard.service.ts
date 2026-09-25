import { ApiError } from "@/lib/errors/ApiError";
import { getCurrentWorkspace, verifyWorkspaceMembership } from "./workspace.service";
import { findTasksDueToday, findUpcomingTasks } from "../repositories/task.repository";
import { findProjectsByWorkspaceAndUser, countProjectsInWorkspace } from "../repositories/project.repository";
import { findRecentActivitiesByWorkspaceId } from "../repositories/activity.repository";
import { getVaultSummary } from "./vault.service";
import { PERSONAL_WORKSPACE_PROJECT_LIMIT } from "@/constants";

export const getPersonalWorkspaceDashboard = async (userId: string) => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const currentWorkspace = await getCurrentWorkspace(userId);
    await verifyWorkspaceMembership(currentWorkspace.id, userId);

    const [
        todayTasks,
        upcomingTasks,
        projects,
        projectCount,
        recentActivities,
        vaultSummary
    ] = await Promise.all([
        findTasksDueToday(currentWorkspace.id),
        findUpcomingTasks(currentWorkspace.id),
        findProjectsByWorkspaceAndUser(userId, currentWorkspace.id),
        countProjectsInWorkspace(currentWorkspace.id),
        findRecentActivitiesByWorkspaceId(currentWorkspace.id, 10),
        getVaultSummary(userId)
    ]);

    return {
        workspace: currentWorkspace,
        stats: {
            today_tasks_count: todayTasks.length,
            upcoming_tasks_count: upcomingTasks.length,
            projects_count: projectCount,
            projects_limit: PERSONAL_WORKSPACE_PROJECT_LIMIT,
            is_limit_reached: projectCount >= PERSONAL_WORKSPACE_PROJECT_LIMIT
        },
        today_tasks: todayTasks,
        upcoming_tasks: upcomingTasks,
        projects: projects.slice(0, 6),
        recent_activities: recentActivities,
        vault: vaultSummary
    };
};

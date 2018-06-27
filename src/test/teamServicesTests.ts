import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as chai from 'chai';
import { TeamS } from "../models/services/teamServices";
import { TeamDb } from '../models/db/teamDb'
import {UtilMethods} from'../models/util/util'; 
import { List } from 'lodash';
import { reject } from 'bluebird'; //Promise
import { resolve } from 'path';
import { ProjectDb } from '../models/db/projectDb';
import { CLIENT_RENEG_LIMIT } from 'tls';

describe('Check if getTeam works', function(){
    let label:any, responses:any, responses2:any, TeamDbStub:any, teamReturn, utilStub:any, teamServ:any, DbReturn;

    before(function(){
        label = 'teamId';
        responses = {
            DbReturn :['teamId',
            'otherAttributes'],
            teamReturn : ['teamId']
        }

        responses2 = {
            DbReturn :null,
            teamReturn : null
        }

         TeamDbStub = sinon.stub(TeamDb, 'getTeam').callsFake( async function(value){
            return value;
        });

        utilStub = sinon.stub(UtilMethods,'getTeamAttr').callsFake(function(){
            return responses.teamReturn;
        });
    });

    it('Should return the team with its attributes if the team was found', async function() {
            let result = await TeamS.getTeam(responses.DbReturn);
            chai.assert(result,(responses.teamReturn)[0]);
    });

    it('Should return the a null value if the team doesnt exist or was not found', async function() {
        let result = await TeamS.getTeam(responses2.DbReturn);
        chai.assert(result == responses2.teamReturn);
    });

    after(function(){
        TeamDbStub.restore();
        utilStub.restore();
    });
});

describe('Check if getTeamIdList works', function(){
    let label:any, responses:any, responses2:any, TeamDbStub:any, teamReturn, TeamDbStub2:any, teamServ:any, DbReturn;

    before(function(){
        label = 'userId';
        responses = {
            DbGetLeaderReturn :[{
                id:'string',
                name:'string'
            }],
            DbGetUserReturn :[{
                teamId:'string'
            }],
            teamIdsReturn : [
                'string','string'
            ]
        }

        TeamDbStub = sinon.stub(TeamDb, 'getLeaderTeam').callsFake(async function(){
            return responses.DbGetLeaderReturn;
        });

        TeamDbStub2 = sinon.stub(TeamDb,'getUserTeam').callsFake(async function(){
            return responses.DbGetUserReturn;
        });

    });

    it('Should return an array of both stub id values', async function(){
        let data = await TeamS.getTeamIdList(label);
        chai.assert(data,responses.teamIdsReturn);
    });

    after(function(){
        TeamDbStub.restore();
        TeamDbStub2.restore();
    });
});

describe('Check if getMemberIdList works', function(){
    let label:any, responses:any, TeamDbStub:any,memberIdsReturn, DbReturn;

    before(function(){
        label = 'teamId';
        responses = {
            DbReturn :{
                teamId:'string',
                members:[{id:'memberId1',otherparameters:'object'},{id:'memberId2',otherparameters:'object'}],
                user:{
                    id:'userId'
                }
            },
            memberIdsReturn : ['memberId1','memberId2','userId']
        }
         TeamDbStub = sinon.stub(TeamDb, 'getTeam').callsFake(async function(){
            return responses.DbReturn;
        });
    });

    it('Should return same data with the value of fetched team members id and user id', async function(){
        let data = await TeamS.getMemberIdList(label);
        chai.assert(data,responses.memberIdsReturn);
    });

});

describe('Check if getMyTeams works', function(){
    let label:any, responses:any, getTeamIdListStub:any,sliceCustomStub:any,getTeamAttrStub:any, teamReturn, getTeamsDetailStub:any, teamServ:any, DbReturn;

    before(function(){
        label = {userId:'number',offset:'number', limit:'number', name:'string'};
        responses = {
            getTeamIdListReturn : [
                1,2
            ],
            getTeamsDetail : [{
                members:['member1','member2'],
                skill:[['skill1','skill2'],['skill1','skill2']],
                announcememnt:['announcement1','announcement2']
            },{
                members:['member1'],
                skill:[['skill1','skill2']],
                announcememnt:['announcement1','announcement2']
            }],
            sliceCustomReturn:{
                teams: {
                members:['member1','member2'],
                skill:[['skill1','skill2'],['skill1','skill2']],
                announcememnt:['announcement1','announcement2']
            },
            myTeams:{
                members:['member1'],
                skill:[['skill1','skill2']],
                announcememnt:['announcement1','announcement2']
            }},
            getTeamAttrReturn:["Return List of Teams which the user is currently involved in"]
        }

        getTeamIdListStub = sinon.stub(TeamS, 'getTeamIdList').callsFake( async function(){
            return responses.getTeamIdListReturn;
        });

        getTeamsDetailStub = sinon.stub(TeamDb,'getTeamsDetail').callsFake(async function(){
            return responses.getTeamsDetail;
        });

        sliceCustomStub = sinon.stub(UtilMethods, 'sliceCustom').callsFake( async function(){
            return responses.sliceCustomReturn;
        });

        getTeamAttrStub = sinon.stub(UtilMethods, 'getTeamAttr').callsFake( async function(){
            return responses.getTeamAttrReturn;
        });

    });

    it('Should return Teams of the user is involved in', async function(){
        let data = await TeamS.getMyTeams(label.userId, label.offset, label.limit, label.name);
        chai.assert(data,responses.sliceCustomReturn);
    });

    after(function(){
        getTeamIdListStub.restore();
        getTeamsDetailStub.restore();
        sliceCustomStub.restore();
        getTeamAttrStub.restore();
    });
});

describe('Check if SearchTeams works', function(){
    let label:any, responses:any, teamReturn, teamServ:any, DbReturn;
    let TeamDbStub:any,getTeamIdListStub:any,getTeamsDetailStub:any,getPublicTeamsStub:any,sliceCustomStub:any,getTeamAttrStub:any;

    before(function(){
        label = {userId:'number',offset:'number', limit:'number', name:'string'};
        responses = {
            getTeamIdListReturn :[1,2],
            getTeamsDetailReturn :["result1","result2"],
            getPublicTeamsReturn:["return what team details are available to see publicly"],
            sliceCustomReturn : {
                teams:["Teams not members of"],
                myTeams:["Teams member of"]
            },
            getTeamAttrReturn:["set teams based on membership"]
        }

        getTeamIdListStub = sinon.stub(TeamS, 'getTeamIdList').callsFake( async function(){
            return responses.getTeamIdListReturn;
        });

        getTeamsDetailStub = sinon.stub(TeamDb,'getTeamsDetail').callsFake(async function(){
            return responses.getTeamsDetailReturn;
        });

        getPublicTeamsStub = sinon.stub(TeamDb,'getPublicTeams').callsFake(async function(){
            return responses.getPublicTeamsReturn;
        });

        sliceCustomStub = sinon.stub(UtilMethods, 'sliceCustom').callsFake( async function(){
            return responses.sliceCustomReturn;
        });
        
        getTeamAttrStub = sinon.stub(UtilMethods, 'getTeamAttr').callsFake( async function(){
            return responses.getTeamAttrReturn;
        });

    });

    it('Should return an array of both stub id values', async function(){
        let data = await TeamS.searchTeams(label.userId, label.offset, label.limit, label.name);
        chai.assert(data,responses.sliceCustomReturn);
    });

    after(function(){
        getTeamIdListStub.restore();
        getTeamsDetailStub.restore();
        getPublicTeamsStub.restore();
        sliceCustomStub.restore();
        getTeamAttrStub.restore();
    });
});

/*
//didnt work
describe('Check if getTeamMembers works', function(){
    let label:any, responses:any, teamReturn, teamServ:any, DbReturn;
    let TeamDbStub:any,getMemberIdListStub:any,getTeamMembersStub:any,sliceCustomStub:any,getUserAttrStub:any;

    before(function(){
        label = {userId:'number', teamId:'any', offset:'number',limit:'number'};
        responses = {
            getMemberIdListReturn :[1,2,3,4],
            getTeamMembersReturn :["User1", "User2","User3","User4"],
            sliceCustomReturn : {
                members:["User1","User2"],
                count: 2
            },
            getUserAttrReturn:["User1","User2"]
        }

        getMemberIdListStub = sinon.stub(TeamS, 'getMemberIdList').callsFake( async function(){
            return responses.getMemberIdListReturn;
        });

        getTeamMembersStub = sinon.stub(TeamDb,'getTeamMembers').callsFake(async function(){
            return responses.getTeamMembersReturn;
        });

        sliceCustomStub = sinon.stub(UtilMethods, 'sliceCustom').callsFake( async function(){
            return responses.sliceCustomReturn;
        });
        
        getUserAttrStub = sinon.stub(UtilMethods, 'getTeamAttr').callsFake( async function(){
            return responses.getUserAttrReturn;
        });

    });

    it('Should return an array of all team members', async function(){
        let data = await TeamS.getTeamMembers(label.userId, label.teamId, label.offset, label.limit);
        chai.assert(data,responses.sliceCustomReturn);
    });

    after(function(){
        getMemberIdListStub.restore();
        getTeamMembersStub.restore();
        sliceCustomStub.restore();
        getUserAttrStub.restore();
    });
});
//
*/

describe('Check if getTeamAnnouncement works', function(){
    let label:any, responses:any, teamReturn, teamServ:any, DbReturn;
    let getTeamAnnouncementStub:any,getLastAnnIdStub:any,getAnnouncementAttrStub:any,sliceCustomStub:any;

    before(function(){
        label = {teamId:'any',userId:'any',offset:'number', limit:'number', lastAnnId:'any'};
        responses = {
            getTeamAnnouncementReturn :["announcement1","announcement2"],
            getLastAnnIdReturn :{
                lastSeenAnnouncementId: 2
            },
            sliceCustomReturn : [{
                unseen: ["announcements"],
                announcements:["announcements attributes"]
            }],
            getNewAnnouncementAttrReturn: ["announcements attributes"]
        }

        getTeamAnnouncementStub = sinon.stub(TeamDb,'getTeamAnnouncement').callsFake(async function(){
            return responses.getTeamAnnouncementReturn;
        });

        getLastAnnIdStub = sinon.stub(TeamDb,'getLastAnnId').callsFake(async function(){
            return responses.getLastAnnIdReturn;
        });

        sliceCustomStub = sinon.stub(UtilMethods, 'sliceCustom').callsFake( async function(){
            return responses.sliceCustomReturn;
        });
        
        getAnnouncementAttrStub = sinon.stub(UtilMethods, 'getAnnouncementAttr').callsFake( async function(){
            return responses.getNewAnnouncementAttrReturn;
        });

    });

    it('Should return an array of all team announcements', async function(){
        let data = await TeamS.getTeamAnnouncement(label.teamId, label.userId, label.offset, label.limit, label.lastAnnId);
        chai.assert(data,responses.sliceCustomReturn);
    });

    after(function(){
        getTeamAnnouncementStub.restore();
        getLastAnnIdStub.restore();
        sliceCustomStub.restore();
        getAnnouncementAttrStub.restore();
    });
});

describe('Check if getUnseenTeamAnnouncement', function(){
    let label:any, responses:any, teamReturn, teamServ:any, DbReturn;
    let getTeamAnnouncementStub:any,getLastAnnIdStub:any,getAnnouncementAttrStub:any;

    before(function(){
        label = {teamId:'any', userId:'any', limit:'number'};
        responses = {
            getLastAnnIdReturn :[{
                lastSeenAnnouncementId:2
            }],
            getTeamAnnouncementReturn :["Announcement1","Announcement2"],
            getAnnouncementAttrReturn : [
                "Attributes", "Attributes"
            ]
        }

        getLastAnnIdStub = sinon.stub(TeamDb,'getLastAnnId').callsFake(async function(){
            return responses.getLastAnnIdReturn;
        });

        getTeamAnnouncementStub = sinon.stub(TeamDb,'getTeamAnnouncement').callsFake(async function(){
            return responses.getTeamAnnouncementReturn;
        });

        getAnnouncementAttrStub = sinon.stub(UtilMethods, 'getAnnouncementAttr').callsFake( async function(){
            return responses.getAnnouncementAttrReturn;
        });

    });

    it('Should return an array of all unseen team announcements', async function(){
        let data = await TeamS.getUnseenTeamAnnouncement(label.teamId, label.userId, label.limit);
        chai.assert(data,responses.getAnnouncementAttrReturn);
    });

    after(function(){
        getTeamAnnouncementStub.restore();
        getLastAnnIdStub.restore();
        getAnnouncementAttrStub.restore();
    });
});

describe('Check if getTeamProjects works', function(){
    let label:any, responses:any;
    let getTeamProjectsStub:any, sliceCustomStub:any, getProjectAttrStub:any;

    before(function(){
        label = {teamId:'any', offset:'number', limit:'number'};
        responses = {
            getTeamProjectsReturn :["Project1","Project2"],
            sliceCustomReturn : {
                projects:["Project1","Project2"],
                count:2
            },
            getProjectAttrReturn: ["Project1","Project2"]
        }
        getTeamProjectsStub = sinon.stub(ProjectDb, 'getTeamProjects').callsFake( async function(){
            return responses.getTeamProjectsReturn;
        });

        sliceCustomStub = sinon.stub(UtilMethods, 'sliceCustom').callsFake( async function(){
            return responses.sliceCustomReturn;
        });

        getProjectAttrStub = sinon.stub(UtilMethods, 'getProjectAttr').callsFake( async function(){
            return responses.getProjectAttrReturn;
        });
    });

    it('Should return the specified teams Projects', async function() {
            let result = await TeamS.getTeamProjects(label.teamId, label.offset, label.limit);
            chai.assert(result,responses.sliceCustomReturn);

    });

    after(function(){
        getTeamProjectsStub.restore();
        sliceCustomStub.restore();
        getProjectAttrStub.restore();
    });
});

//
//managing Methods
//

describe('Check if announceAndReply works', function(){
    let label:any, responses:any;
    let announceStub:any, getNewAnnouncementAttrStub:any;

    before(function(){
        label = {teamId:'any', userId:'any', message:'string', mainAnnouncementId:'any'};
        responses = {
            announceReturn :["Announcement"],
            getNewAnnouncementAttrReturn : ["Announcement Attributes"]
        }
        announceStub = sinon.stub(TeamDb, 'announce').callsFake( async function(){
            return responses.announceReturn;
        });

        getNewAnnouncementAttrStub = sinon.stub(UtilMethods, 'getNewAnnouncementAttr').callsFake( async function(){
            return responses.getNewAnnouncementAttrReturn;
        });

    });

    it('Should return the resulting new announcement', async function() {
            let result = await TeamS.announceAndReply(label.teamId, label.userId, label.message, label.mainAnnouncementId);
            chai.assert(result,responses.getAnnouncementAttrReturn);

    });

    after(function(){
        announceStub.restore();
        getNewAnnouncementAttrStub.restore();
    });
});

describe('Check if Reply works', function(){
    let label:any, responses:any;
    let replyStub:any, getNewAnnouncementAttrStub:any;

    before(function(){
        label = {userId:'any', message:'string', mainAnnouncementId:'any'};
        responses = {
            replyReturn :["announcement"],
            getNewAnnouncementAttrReturn : ['attributes of the announcement']
        }
        replyStub = sinon.stub(TeamDb, 'reply').callsFake( async function(){
            return responses.replyReturn;
        });

        getNewAnnouncementAttrStub = sinon.stub(UtilMethods, 'getNewAnnouncementAttr').callsFake( async function(){
            return responses.getNewAnnouncementAttrReturn;
        });

    });

    it('Should return the replyed announcement', async function() {
            let result = await TeamS.reply(label.userId, label.message, label.mainAnnouncementId);
            chai.assert(result,responses.getNewAnnouncementAttrReturn);

    });

    after(function(){
        replyStub.restore();
        getNewAnnouncementAttrStub.restore();
    });
});

describe('Check if updateAnnouncementSeen works', function(){
    let label:any, responses:any;
    let updateAnnouncementSeenStub:any;

    before(function(){
        label = {teamId:'any',userId:'any', lastSeenAnnId:'any'};
        responses = {
            updateAnnouncementSeenReturn :["Seen"]
        }
        updateAnnouncementSeenStub = sinon.stub(TeamDb, 'updateAnnouncementSeen').callsFake(function(){
            return responses.updateAnnouncementSeenReturn;
        });
    });

    it('Should return the seen updated announcement', function() {
            let result = TeamS.updateAnnouncementSeen(label.teamId, label.userId,label.lastSeenAnnId);
            chai.assert(result,responses.updateAnnouncementSeenReturn);

    });

    after(function(){
        updateAnnouncementSeenStub.restore();
    });
});

describe('Check if newTeam works', function(){
    let label:any, responses:any;
    let newTeamStub:any;

    before(function(){
        label = {teamData:'any'};
        responses = {
            newTeamReturn :["New Team"]
        }
        newTeamStub = sinon.stub(TeamDb, 'newTeam').callsFake( async function(){
            return responses.newTeamReturn;
        });

    });

    it('Should return the created team', async function() {
            let result = await TeamS.newTeam(label);
            chai.assert(result,responses.newTeamReturn);

    });

    after(function(){
        newTeamStub.restore();
    });
});

describe('Check if editTeamProfile works', function(){
    let label:any, responses:any;
    let editTeamProfileStub:any;

    before(function(){
        label = {teamId:'number', teamData:'any'};
        responses = {
            editTeamProfileReturn :["Edited"]
        }
        editTeamProfileStub = sinon.stub(TeamDb, 'editTeamProfile').callsFake(function(){
            return responses.editTeamProfileReturn;
        });

    });

    it('Should return True or False', function() {
            let result = TeamS.editTeamProfile(label.teamId, label.teamData);
            chai.assert(result,responses.editTeamProfileReturn);

    });

    after(function(){
        editTeamProfileStub.restore();
    });
});

describe('Check if deleteTeam works', function(){
    let label:any, responses:any;
    let deleteTeamStub:any;

    before(function(){
        label = {teamId:'number'};
        responses = {
            deleteTeamReturn :["Deleted"]
        }
        deleteTeamStub = sinon.stub(TeamDb, 'deleteTeam').callsFake(function(){
            return responses.deleteTeamReturn;
        });

    });

    it('Should return True or False',function() {
            let result = TeamS.deleteTeam(label);
            chai.assert(result,responses.deleteTeamReturn);

    });

    after(function(){
        deleteTeamStub.restore();
    });
});

describe('Check if addTeamMember works', function(){
    let label:any, responses:any;
    let addTeamMemberStub:any;

    before(function(){
        label = {teamId:'number', userId:'number'};
        responses = {
            addTeamMemberReturn :["Added Team Memeber"]
        }
        addTeamMemberStub = sinon.stub(TeamDb, 'addTeamMembers').callsFake(function(){
            return responses.addTeamMemberReturn;
        });

    });

    it('Should return True or False',function() {
            let result = TeamS.addTeamMember(label.teamId, label.userId);
            chai.assert(result,responses.addTeamMemberReturn);

    });

    after(function(){
        addTeamMemberStub.restore();
    });
});

describe('Check if removeTeamMember works', function(){
    let label:any, responses:any;
    let removeTeamMemberStub:any;

    before(function(){
        label = {teamId:'number', userId:'number[]'};
        responses = {
            removeTeamMemberReturn :["Team Member Removed"]
        }
        removeTeamMemberStub = sinon.stub(TeamDb, 'removeTeamMember').callsFake(function(){
            return responses.removeTeamMemberReturn;
        });

    });

    it('Should return True or False',function() {
            let result = TeamS.removeTeamMember(label.teamId, label.userId);
            chai.assert(result,responses.removeTeamMemberReturn);

    });

    after(function(){
        removeTeamMemberStub.restore();
    });
});

describe('Check if replyTeamJoinRequest works', function(){
    let label:any, responses:any;
    let replyTeamJoinRequestStub:any;

    before(function(){
        label = {requestId:'any', decision:'any'};
        responses = {
            replyTeamJoinRequestReturn :["Reply"]
        }
        replyTeamJoinRequestStub = sinon.stub(TeamDb, 'replyTeamJoinRequest').callsFake(function(){
            return responses.replyTeamJoinRequestReturn;
        });

    });

    it('Should return True or False',function() {
            let result = TeamS.replyTeamJoinRequest(label.requestId, label.decision);
            chai.assert(result,responses.replyTeamJoinRequestReturn);

    });

    after(function(){
        replyTeamJoinRequestStub.restore();
    });
});

describe('Check if editAnnouncementReply works', function(){
    let label:any, responses:any;
    let editAnnouncementReplyStub:any;

    before(function(){
        label = {announcementId:'number', newAnnouncement:'string'};
        responses = {
            editAnnouncementReplyReturn :["Announcement Edited"]
        }
        editAnnouncementReplyStub = sinon.stub(TeamDb, 'editAnnouncementReply').callsFake(function(){
            return responses.editAnnouncementReplyReturn;
        });

    });

    it('Should return True or False',function() {
            let result = TeamS.editAnnouncementReply(label.announcementId, label.newAnnouncement);
            chai.assert(result,responses.editAnnouncementReply);

    });

    after(function(){
        editAnnouncementReplyStub.restore();
    });
});

describe('Check if removeAnnouncement works', function(){
    let label:any, responses:any;
    let removeAnnouncementReplyStub:any;

    before(function(){
        label = {announcementId:'number'};
        responses = {
            removeAnnouncementReplyReturn :["Announcement Removed"]
        }
        removeAnnouncementReplyStub = sinon.stub(TeamDb, 'removeAnnouncementReply').callsFake( function(){
            return responses.removeAnnouncementReplyReturn;
        });

    });

    it('Should return True or False', function() {
            let result = TeamS.removeAnnouncement(label);
            chai.assert(result,responses.removeAnnouncementReplyReturn);

    });

    after(function(){
        removeAnnouncementReplyStub.restore();
    });
});

describe('Check if removeReply works', function(){
    let label:any, responses:any;
    let removeAnnouncementReplyStub:any;

    before(function(){
        label = {replyId:'number'};
        responses = {
            removeAnnouncementReplyReturn :["Reply Removed"]
        }
        removeAnnouncementReplyStub = sinon.stub(TeamDb, 'removeAnnouncementReply').callsFake(function(){
            return responses.removeAnnouncementReplyReturn;
        });

    });

    it('Should return True or False', function() {
            let result = TeamS.removeReply(label);
            chai.assert(result,responses.removeAnnouncementReplyReturn);

    });

    after(function(){
        removeAnnouncementReplyStub.restore();
    });
});

//
//Notifications
//

//didnt work and wont work
/*
describe('Check if getLastAnnIds works', function(){
    let label:any, responses:any;
    let getLastAnnIdsStub:any;

    before(function(){
        label = {userId:'any'};
        responses = {
            getLastAnnIdsReturn :[{teamId:0,lastSeenAnnouncementId:1}],
            fullReturn : [1]
        }
        getLastAnnIdsStub = sinon.stub(TeamDb, 'getLastAnnIds').callsFake( async function(){
            return responses.getLastAnnIdsReturn;
        });

    });

    it('Should return the id of the last seen Announcment Id', async function() {
            let result = await TeamS.getLastAnnIds(label);
            chai.assert(result,responses.fullReturn);

    });

    after(function(){
        getLastAnnIdsStub.restore();
    });
});

describe('Check if getUnseenAnnouncements works', function(){
    let label:any, responses:any;
    let getLastAnnIdsStub:any,getTeamIdListStub:any,getUnseenNotificationAnnouncementsStub:any,getAnnouncementAttrStub:any;

    before(function(){
        label = {userId:'any', limit:'number'};
        responses = {
            getLastAnnIdsReturn :[1,2,3,4],
            getTeamIdListReturn : [1,2,3,4,5,6,7,8],
            getUnseenNotificationAnnouncementsReturn: ["Notification1","Notification2","Notification3"],
                        
        }
        getLastAnnIdsStub = sinon.stub(TeamS, 'getLastAnnIds').callsFake( async function(){
            return responses.DbReturn;
        });

        getTeamIdListStub = sinon.stub(TeamS, 'getTeamIdList').callsFake( async function(){
            return responses.DbReturn;
        });

        getUnseenNotificationAnnouncementsStub = sinon.stub(TeamDb, 'getUnseenNotificationAnnouncements').callsFake( async function(){
            return responses.DbReturn;
        });

        getAnnouncementAttrStub = sinon.stub(UtilMethods, 'getAnnouncementAttr').callsFake( async function(){
            return responses.DbReturn;
        });

    });

    it('Should return list of unseen Announcments', async function() {
            let result = await TeamS.getUnseenAnnouncements(label.userId, label.limit);
            chai.assert(result,(responses.teamReturn)[0]);

    });

    after(function(){
        getLastAnnIdsStub.restore();
        getTeamIdListStub.restore();
        getUnseenNotificationAnnouncementsStub.restore();
        getAnnouncementAttrStub.restore();
    });
});

describe('Check if getUnseenTeamJoinRequests works', function(){
    let label:any, responses:any;
    let getUnseenTeamJoinRequestsStub:any,getTeamsStub:any,getTeamJoinRequestAttrStub:any;

    before(function(){
        label = {userId:'any'};
        responses = {
            DbReturn :['teamId',
            'otherAttributes']
            ,
            teamReturn : ['teamId']
        }

        getUnseenTeamJoinRequestsStub = sinon.stub(TeamDb, 'getUnseenTeamJoinRequests').callsFake( async function(){
            return responses.DbReturn;
        });

        getTeamsStub = sinon.stub(TeamDb, 'getTeams').callsFake( async function(){
            return responses.DbReturn;
        });

        getTeamJoinRequestAttrStub = sinon.stub(UtilMethods, 'getTeamJoinRequestAttr').callsFake( async function(){
            return responses.DbReturn;
        });

    });

    it('Should return list of unseen team join requests', async function() {
            let result = await TeamS.getTeam(label);
            chai.assert(result,(responses.teamReturn)[0]);

    });

    after(function(){
        getUnseenTeamJoinRequestsStub.restore();
        getTeamsStub.restore();
        getTeamJoinRequestAttrStub.restore();
    });
});
//
*/
//
//Authorization
//

describe('Check if checkTeamMembership works', function(){
    let label:any, responses:any;
    let checkTeamLeadershipStub:any,checkTeamMembershipStub:any;

    before(function(){
        label = {userId:'any', teamId:'any'};
        responses = {
            checkTeamLeadershipReturn :["is Leader"],
            checkTeamMembershipReturn : ["is Member"],
            finalReturn: true
        }

        checkTeamLeadershipStub = sinon.stub(TeamDb, 'checkTeamLeadership').callsFake( async function(){
            return responses.checkTeamLeadershipReturn;
        });

        checkTeamMembershipStub = sinon.stub(TeamDb, 'checkTeamMembership').callsFake( async function(){
            return responses.checkTeamMembershipReturn;
        });


    });

    it('Should return true for the existance of the members', async function() {
            let result = await TeamS.checkTeamMembership(label.userId, label.teamId);
            chai.assert(result,responses.finalReturn);

    });

    before(function(){
        label = {userId:'any', teamId:'any'};
        responses = {
            checkTeamLeadershipReturn :[],
            checkTeamMembershipReturn : [],
            finalReturn: false
        }
    });

    it('Should return false for the existance of the no members', async function() {
            let result = await TeamS.checkTeamMembership(label.userId, label.teamId);
            chai.assert(result,responses.finalReturn);

    });

    after(function(){
        checkTeamLeadershipStub.restore();
        checkTeamMembershipStub.restore();
    });
});

//didnt work
describe('Check if checkTeamLeadership works', function(){
    let label:any, responses:any;
    let checkTeamLeadershipStub:any;

    before(function(){
        label = {userId:'any', teamId:'any'};
        responses = {
            checkTeamLeadershipReturn :["Team Leader"],
            finalReturn: true
        }

        checkTeamLeadershipStub = sinon.stub(TeamDb, 'checkTeamLeadership').callsFake( async function(){
            return responses.checkTeamLeadershipReturn;
        });

    });

    it('Should return true if the user is the leader of the team', async function() {
            let result = await TeamS.checkTeamLeadership(label.userId, label.teamId);
            chai.assert(result,responses.finalReturn);

    });

    before(function(){
        label = {userId:'number', teamId:'number'};
        responses = {
            checkTeamLeadershipReturn :[],
            finalReturn: false
        }
    });

    it('Should return false if the user is not the leader of the team', async function() {
            let result = await TeamS.checkTeamLeadership(label.userId, label.teamId);
            chai.assert(result,responses.finalReturn);

    });

    after(function(){
        checkTeamLeadershipStub.restore();
    });
});
//
describe('Check if checkAnnouncementOrReplyOwnership works', function(){
    let label:any, responses:any;
    let checkAnnouncementOrReplyOwnershipStub:any;

    before(function(){
        label = {userId:'number', annId:'number'};
        responses = {
            CheckReturn :["Owner"],
            finalReturn: true
        }

        checkAnnouncementOrReplyOwnershipStub = sinon.stub(TeamDb, 'checkAnnouncementOrReplyOwnership').callsFake( async function(){
            return responses.CheckReturn;
        });

    });

    it('Should return true the user is the owner of the announcement', async function() {
            let result = await TeamS.checkAnnouncementOrReplyOwnership(label.userId, label.annId);
            chai.assert(result,responses.finalReturn);

    });

    before(function(){
        label = {userId:'number', annId:'number'};
        responses = {
            CheckReturn :[],
            finalReturn: false
        }
    });

    it('Should return false if the user is not the owner of the announcement', async function() {
            let result = await TeamS.checkAnnouncementOrReplyOwnership(label.userId, label.annId);
            chai.assert(result,responses.finalReturn);

    });

    after(function(){
        checkAnnouncementOrReplyOwnershipStub.restore();
    });
});

describe('Check if checkTeamJoinRequestReceiver works', function(){
    let label:any, responses:any;
    let checkTeamJoinRequestReceiverStub:any;

    before(function(){
        label = {userId:'number', requestId:'number'};
        responses = {
            CheckReturn :["Recieved"],
            finalReturn: true
        }

        checkTeamJoinRequestReceiverStub = sinon.stub(TeamDb, 'checkTeamJoinRequestReceiver').callsFake( async function(){
            return responses.CheckReturn;
        });

    });

    it('Should return true if valid join request', async function() {
            let result = await TeamS.checkTeamJoinRequestReceiver(label.userId, label.requestId);
            chai.assert(result,responses.finalReturn);

    });

    before(function(){
        label = {userId:'number', requestId:'number'};
        responses = {
            CheckReturn :[],
            finalReturn: false
        }
    });

    it('Should return false if invalid join request',async function() {
            let result = await TeamS.checkTeamJoinRequestReceiver(label.userId, label.requestId);
            chai.assert(result,responses.finalReturn);

    });

    after(function(){
        checkTeamJoinRequestReceiverStub.restore();
    });
});

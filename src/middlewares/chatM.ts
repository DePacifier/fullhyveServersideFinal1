import * as express from "express";
import {ChatS} from "../models/services/chatServices";
import { create } from "domain";
import { UserConst } from "../models/constants/constant";
import { UtilMethods } from "../models/util/util";
import { setTimeout } from "timers";
import { RealtimeServer } from "../controllers/realtimeServer";

export class ChatM{
    public static getFriends(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let offset:number = req.validData.offset;
        let limit:number = req.validData.limit;
    
        ChatS.getChatFriends(userId, offset, limit)
        
        .then((result)=>{
            console.log(result);
            callback({success:true, code:200, message:"Successfully fetched",data: result});
        }).catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static searchUsers(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let name:string = req.validData.name;
        let offset:number = req.validData.offset;
        let limit:number = req.validData.limit;

        ChatS.searchUsers(userId,name,offset,limit)
        
        .then((result:any)=>{
            console.log(result);
            callback({success:true, code:200, message:"Successfully fetched",data: result})
        }).catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null})
        });
    }

    public static getMessages(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let friendId:number = req.validData.friendId;
        let offset:number = req.validData.offset;
        let limit:number = req.validData.limit;

        ChatS.getChatMessages(userId, friendId, offset, limit)

        .then((result)=>{
            console.log(result);
            callback({success:true, code:200, message:"Successfully fetched",data: result});
        })
        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static updateSeen(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let lastMessageId:number = req.validData.lastMessageId;
        let contactIdR:number;

        ChatS.getContactIdFromMessageId(lastMessageId)
        
        .then((contactId:any):any=>{
            if(contactId){
                contactIdR = contactId;
                return ChatS.checkUserOwnsContactId(userId, contactId);
            } 
            return null;
        })

        .then((isMessageRecSender:any):any=>{
            if(isMessageRecSender){
                return ChatS.updateSeen(userId,contactIdR, lastMessageId);
            } else{
                callback({success:true, code:403, message:"Unauthorized access",data: null}); 
            }
        })

        .then(()=>{
            callback({success:true, code:200, message:null,data: null});
        })

        .catch((err:any)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    

    public static sendMessage(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let friendId:number = req.validData.friendId;
        let message:string = req.validData.message;
        console.log("In send message");

        ChatS.sendChatMessage(userId, friendId, message)

        .then((result)=>{
            if(RealtimeServer.isFriendOnline(friendId)){
                result['friendId'] = userId;
                console.log(result);
                RealtimeServer.socketMain['/chat'].onlineUsers[friendId].emit('receiveMessageR', result);
            }
            callback({success:true, code:200, message:"Successfully sent",data: result})
        })

        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static forwardMessage(req:any, callback:any){
        let userId:number = req.thisUser.id;
        let friendIds:number[] = req.validData.friendIds;
        let messageId:number = req.validData.messageId;

        ChatS.forwardMessage(userId, friendIds, messageId)

        .then((result)=>{
            callback({success:true, code:200, message:"Successfully fetched",data: result})
        })

        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static editMessage(req:any, callback:any){
        let messageId:number = req.validData.messageId;
        let content:string = req.validData.newMessage;

        ChatS.editMessage(messageId, content)

        .then((status)=>{
            callback({success:true, code:200, message:null,data: null});
        })

        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static deleteMessage(req:any, callback:any){
        let messageId:number = req.validData.messageId;

        ChatS.deleteMessage(messageId)

        .then((status)=>{
            callback({success:true, code:200, message:null,data: null});
        })

        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }

    public static getFriendLastSeenTime(req:any, callback:any){
        let friendId:number = req.validData.friendId;

        ChatS.getFriendLastSeenTime(friendId)

        .then((response)=>{
            if(RealtimeServer.isFriendOnline(friendId)){
                callback({success:true, code:200, message:null,data: {online:true, timestamp:new Date().toISOString()}});
            } else{
                callback({success:true, code:200, message:null,data: response});
            }
        })

        .catch((err)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        });
    }



    // extra==========================================================================
    static getUnseenMessages(req:any, callback:any){
        let homeReturn:any = [];
        let userId:any = req.thisUser.id;
        
        ChatS.getUnseenReceivedMessages(userId)
        
        .then((messages)=>{
            homeReturn = messages;
            
            callback({success:true, code:200, message:null,data: homeReturn});
        })

        .catch((err:any)=>{
            callback({success:false, code:500, message:"Internal server error",data: null});
        })        
    }

    
}

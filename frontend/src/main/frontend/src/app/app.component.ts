import { Component, OnInit } from '@angular/core';

import { Model } from './model';

import { PubNubAngular } from 'pubnub-angular2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent implements OnInit{
  title = 'PubNub Console';
  pubnub: PubNubAngular;
  subscribeFlag = false;
  subscribedMessage: any[];
  model = new Model('pub-c-c562f638-b16d-4c25-b35a-f586e8c5d39f', 'sub-c-1d62191a-8714-11e7-ac3a-f2b7c362e666', 'Channel-8hz4d9157', 'language == "english"', null, '','',[], null);

  constructor(pubnub: PubNubAngular){
    this.pubnub = pubnub;
  }

  ngOnInit() {  }

  subscribe(model, isGroupSubscription) {

    this.subscribeFlag = true;

    // PubNub Init method to register Subscribe and Publish Key
    this.pubnub.init({
      publishKey: model.publishKey,
      subscribeKey: model.subscriptionKey,
      logVerbosity: false
    });

    this.pubnub.setFilterExpression(model.filter);

    this.pubnub.addListener({
      message: function(response) {
       /* // handle message
        let channelName = response.channel; // The channel for which the message belongs
        let channelGroup = response.subscription; // The channel group or wildcard subscription match (if exists)
        let pubTT = response.timetoken; // Publish timetoken
        let msg = response.message; // The Payload*/

        console.log(response);

        if(this.isObject(response)){
          if(this.subscribedMessage) {
            this.subscribedMessage.push(JSON.stringify(response.message,null,2));
          }else {
            this.subscribedMessage = new Array(JSON.stringify(response.message,null,2));
          }
        }else{
          if(this.subscribedMessage) {
            this.subscribedMessage.push(response.message);
          }else {
            this.subscribedMessage = new Array(response.message);
          }
        }
      }.bind(this),
      presence: function(p) {
       /* // handle presence
        let action = p.action; // Can be join, leave, state-change or timeout
        let channelName = p.channel; // The channel for which the message belongs
        let occupancy = p.occupancy; // No. of users connected with the channel
        let state = p.state; // User State
        let channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
        let presenceEventTime = p.timestamp; // Presence event timetoken
        let uuid = p.uuid; // UUIDs of users who are connected with the channel*/
      }.bind(this),
      status: function(status) {
        /*// handle status
        let category = status.category; //PNConnectedCategory
        let operation = status.operation; //PNSubscribeOperation
        let affectedChannels = status.affectedChannels; //The channels affected in the operation, of type array.
        let subscribedChannels = status.subscribedChannels; //All the current subscribed channels, of type array.
        let affectedChannelGroups = status.affectedChannelGroups; //The channel groups affected in the operation, of type array.
        let lastTimetoken = status.lastTimetoken; //The last timetoken used in the subscribe request, of type long.
        let currentTimetoken = status.currentTimetoken; //The current timetoken fetched in the subscribe response, which is going to be used in the next request, of type long.
        */
        console.log(status);
        if(!status.error){
          this.subscribeFlag = true;

          if(this.subscribedMessage) {
            this.subscribedMessage.push( JSON.stringify(status, null, ' ')+"\n");
          }else {
            this.subscribedMessage = new Array(JSON.stringify(status, null, ' ')+"\n");
          }
        }else{
          this.subscribedMessage.push("Error in :: "+status.operation+" Error Code :: "+status.statusCode+"\n");
        }
      }.bind(this)
    });

  if(isGroupSubscription){
	  this.pubnub.channelGroups.addChannels({
		  channels: model.channelGroupArray,
          channelGroup: model.channelGroup,
		  triggerEvents: true
        },function(status,response) {
          if (status.error) {
            console.log("operation failed w/ status: ", status);
          } else {
            console.log("operation done!");
			this.pubnub.subscribe({
				channelGroups: [model.channelGroup],
				triggerEvents: true
			})
          }
        }.bind(this));
  }else{
	   this.pubnub.subscribe({
      channels: [model.channel],
      triggerEvents: true
    });
  }
	  
   
  }




  unSubscribe() {

    this.pubnub.unsubscribeAll();
	//this.pubnub.unsubscribe({
    //  channel: this.model.channel
    //});
    this.pubnub.removeAllListeners();
    this.subscribeFlag = false;
	if(this.subscribedMessage) {
            this.subscribedMessage.push( "Unsubscribed from all the channels and Groups\n");
          }else {
            this.subscribedMessage = new Array("Unsubscribed from all the channels and Groups\n");
          }
    }

  addChannel(channel) {
    if(channel){
      this.model.channel= channel;
      console.log("Channel:\""+channel+"\" added");
    }else{
      console.log("cannot add empty channel");
    }
  }

  removeChannel() {
    console.log("Channel:\""+this.model.channel+"\" removed");
    this.model.channel= "";
  }

  removeFilter(){
    console.log("Filter:\""+this.model.filter+"\" removed");
    this.model.filter= "";
  }

  IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getType = function (elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  isObject = function (elem) {
    return this.getType(elem) === 'Object';
  };

  publish(model) {

    if(this.IsJsonString(model.message)){
      // PubNub Publish Method
      this.pubnub.publish({
        channel: model.channel, message: JSON.parse(model.message), meta: JSON.parse(model.metaData)
      },function (status, response) {
        console.log(status);
        console.log(response);
        if(!status.error){
          model.timeToken=response.timetoken;
		   //this.subscribedMessage.push( JSON.stringify(model.message, null, ' ')+"\n");
          console.log("Published Succesfully !");
        }else{
          console.log("Published Failed !");
		  //this.subscribedMessage.push("Error in :: "+status.operation+" Error Code :: "+status.statusCode+"\n");
        }
      });
    }else{
      model.timeToken="";
      alert("Publish Message Should be Json");
      console.log("Published Failed !");
    }
  }
  
  addChannelToGroup(model) {
	  console.log(model.channel);
	  
		  this.model.channelGroupArray.push(this.model.channel);
		  
		  if(this.subscribedMessage){
			this.subscribedMessage.push(this.model.channelGroup+" Channel Group ("+this.model.channelGroupArray.toString()+")\n");  
		  }else{
			  this.subscribedMessage = new Array(this.model.channelGroup+" Channel Group ("+this.model.channelGroupArray.toString()+")\n");
		  }
  }

  

}
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  AsyncStorage,
  ListView,
  Platform
} from 'react-native';

storageKey = "@AVEgameData:"

monospace = (Platform.OS === "ios") ? "Courier New" : "monospace"

function addItems(adds, myInventory) {
  for(var j=0;j<adds.length;j++){//+
      myInventory.push(adds[j]);
  }
  return myInventory
}

function removeItems(rems, myInventory) {
  for(var j=0;j<line[1][1].length;j++){//~
      index=myInventory.indexOf(rems[j]);
      if(index!=-1){
          myInventory.splice(index,1);
      }
  }
  return myInventory
}

function getRoom(id, rooms, myInventory){
    roomtext=""
    if ( !(id in rooms) ) {
      return ("",[],myInventory)
    }
    for(var i=0;i<rooms[id][0].length;i++){
        line=rooms[id][0][i]
        pass=true;
        for(var j=0;j<line[1][2].length;j++){//?
            if(myInventory.indexOf(line[1][2][j])==-1){
                pass=false;
            }
        }
        for(var j=0;j<line[1][3].length;j++){//?!
            if(myInventory.indexOf(line[1][3][j])!=-1){
                pass=false;
            }
        }
        if(pass){
            for(var j=0;j<line[1][0].length;j++){//+
                myInventory.push(line[1][0][j]);
            }
            for(var j=0;j<line[1][1].length;j++){//~
                index=myInventory.indexOf(line[1][1][j]);
                if(index!=-1){
                    myInventory.splice(index,1);
                }
            }
        roomtext += line[0] + " "
        }
    }

    options=Array();
    for(var i=0;i<rooms[id][1].length;i++){
        line=rooms[id][1][i]
        pass=true;
        for(var j=0;j<line[2][2].length;j++){//?
            if(myInventory.indexOf(line[2][2][j])==-1){
                pass=false;
            }
        }
        for(var j=0;j<line[2][3].length;j++){//?!
            if(myInventory.indexOf(line[2][3][j])!=-1){
                pass=false;
            }
        }
        if(pass){
            options.push(Array(line[0],line[1],line[2][0],line[2][1]))
        }
    }
    return Array(roomtext,options, myInventory)
}

function getInventory(myInventory, items){
    var inve = Array()
    for(var i=0;i<myInventory.length;i++){
        if( (myInventory[i] in items) && (!items[myInventory[i]][1]) ){
            item = items[myInventory[i]]
            for(var j=0;j<item[0].length;j++){
                pass=true;
                for(var k=0;k<item[0][j][1][2].length;k++){//?
                    if(myInventory.indexOf(item[0][j][1][2][k])==-1){
                        pass=false;
                    }
                }
                for(var k=0;k<item[0][j][1][3].length;k++){//?
                    if(myInventory.indexOf(item[0][j][1][3][k])!=-1){
                        pass=false;
                    }
                }
                if(pass){
                    inve.push(item[0][j][0])
                }
            }
        }
    }
    return inve
}

class RoomView extends Component {
  constructor(props) {
    super(props);
    this.ds_inv = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.ds_opt = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSourceInv: this.ds_inv.cloneWithRows(this.props.inv),
      dataSourceOpt: this.ds_opt.cloneWithRows(this.props.opt)
    };
  }
  render() {
    dataSourceOpt = this.ds_opt.cloneWithRows(this.props.opt)
    dataSourceInv = this.ds_inv.cloneWithRows(this.props.inv)
    return(
      <View style={styles.container}>
        <View style={styles.roomInvCont}>
          <View style={styles.roomDescriptionCont}>
            <Text style={styles.roomDescription}>{this.props.roomDesc}</Text>
          </View>
          <View style={styles.invContainer}>
            <Text style={styles.roomDescription}>INVENTORY</Text>
            <ListView
              dataSource={dataSourceInv}
              renderRow={(rowData) => <Text style={styles.roomDescription}>{rowData}</Text>}
            />
          </View>
        </View>
        <View>
          <ListView
           dataSource={dataSourceOpt}
           renderRow={this._renderRow.bind(this)}
          />
        </View>
      </View>
  )
  }
  _renderRow(data, sectionId, rowId) {
    /* return (<Text style={styles.menuItem}>{data[0]}</Text>) */
    return( <HighlightItem text={data[0]} next={data[1]} par={this.props.par} adds={data[2]} rems={data[3]} />)
  }
  onCollapse() {
    newArray = this.props.opt
    this.setState({
        dataSourceOpt: this.state.dataSourceOpt.cloneWithRows(newArray),
    });
}
}

class RoomDescription extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Text style={styles.roomDescription}>this.props.text</Text>
    )
  }
}

class HighlightItem extends Component {
  constructor(props) {
    super(props)
  }
  onPressButton() {
    this.props.par._onPressButton(this)
  }
  render() {
    return (
      <TouchableHighlight onPress={()=>this.onPressButton()}>
        <Text style={styles.menuItem}>
          {this.props.text}
        </Text>
      </TouchableHighlight>
    )
  }
}

class GameTitle extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return(
    <View style={styles.container}>
    <View style={styles.titleContParent}>
      <View style={styles.titleCont}>
        <Text style={styles.gameTitle}>
          {this.props.title}
        </Text>
      </View>
      <View style={styles.titleCont}>
        <Text style={styles.gameAuthors}>
          {"By: " + this.props.authors}
        </Text>
      </View>
      <View style={styles.titleCont}>
        <Text style={styles.gameDesc}>
          {this.props.description}
        </Text>
      </View>
      </View>
      <View style={styles.gameOverMenu}>
        <TouchableHighlight onPress={()=>this.props.par._startGame()}>
          <Text style={styles.menuItem}>
            Play game
          </Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={()=>this.props.par._startAgain()}>
          <Text style={styles.menuItem}>
            Main menu
          </Text>
        </TouchableHighlight>
      </View>
    </View>
  )
  }
}

class GameOver extends Component {
  constructor(props) {
    super(props)
  }
  reload(again) {
    this.props.par._onPressGameOver(again)
  }
  render() {
    return(
      <View style={styles.container}>
        <View style={styles.gameOver}>
          <View style={styles.gameOverTextCont}>
            <Text style={styles.gameOverText}>{this.props.text}</Text>
          </View>
        </View>
        <View style={styles.gameOverMenu}>
          <TouchableHighlight onPress={()=>this.reload(true)}>
            <Text style={styles.menuItem}>
              Play again
            </Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={()=>this.reload(false)}>
            <Text style={styles.menuItem}>
              Play a different game
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

class MenuScreen extends Component {
  constructor(props) {
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  }
  render() {
    return(
      <View style={styles.container}>
        <Text style={styles.gameOverText}>
        AVE
        </Text>
        <View style={styles.gameOverMenu}>
          <TouchableHighlight id="tea" onPress={()=>this.props.par._loadGame('tea')}>
            <Text style={styles.menuItem}>
              Wonderful tea journey
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

export default class AVEmobile extends Component {
  constructor() {
    super()
    this._onPressButton = this._onPressButton.bind(this);
    this._start = this._start.bind(this);
    var gameData = require('./tea.json')
    var gameDataStr = JSON.stringify(gameData)
    AsyncStorage.setItem(storageKey + 'tea',gameDataStr).then().done()
    this._start()
    this.state = {displayType: "menu", roomId: "start", inventory: [], realInv: [" "], gameList: [" "]}
  }
  _onPressButton(option) {
    var inv = JSON.parse(JSON.stringify(this.state.inventory))
    addItems(option.props.adds, this.state.inventory)
    removeItems(option.props.rems, this.state.inventory)
    roomResult = getRoom(option.props.next, this.state.gameData.rooms, this.state.inventory)
    realInvNew = this._getInventory()
    this.setState({roomId: option.props.next, roomDesc: roomResult[0], roomOpts: roomResult[1], realInv: realInvNew})
  }
  _onPressGameOver(again) {
    if (again) {
      this._startGame()
    }
    else {
      this._startAgain()
    }
  }
  _startAgain() {
    this._start()
    this.setState({displayType: "menu"})
  }
  async _menu(keyList) {
    this.setState({displayType: "menu", roomId: "start", inventory: [], realInv: [" "], gameList: keyList})
  }
  async _start() {
    AsyncStorage.getAllKeys((err,keys)=> {AsyncStorage.multiGet(keys, this._menu.bind(this))})
    /*this._loadGame('tea') /* remove this when done*/
  }
  async _loadGame(gameKey) {
    try {
      await AsyncStorage.getItem(storageKey + gameKey).then((value) => { this.setState({gameData:JSON.parse(value)}); this._showTitle()}).done()
    }
    catch (error) {
      console.log("Error getting data")
    }
  }
  _showTitle() {
    this.setState({displayType: "title"})
  }
  _startGame() {
    roomResult = getRoom("start", this.state.gameData.rooms, [])
    this.setState({displayType: "room", roomDesc: roomResult[0], roomOpts: roomResult[1], inventory:[], realInv: [" "], roomId: "start"})
  }
  _getInventory() {
    inv = getInventory(this.state.inventory,this.state.gameData.items)
    return (inv.length > 0 ? inv : [" "])
  }
  render() {
    if ( this.state.displayType === "menu" ) {
      r = <MenuScreen par={this}/>
    }
    else if (this.state.displayType === "title") {
      gameInfo = this.state.gameData.gameInfo
      r = <GameTitle par={this} title={gameInfo.title} authors={gameInfo.author} description={gameInfo.desc}/>
    }
    else if (this.state.displayType === "room") {
      var roomId = this.state.roomId
      if ( roomId === "__GAMEOVER__") {
        r = <GameOver par={this} text="GAME OVER"/>
      }
      else if (roomId === "__WINNER__") {
        r = <GameOver par={this} text="YOU WIN"/>
      }
      else if ( (this.state.displayType === "room") && !(roomId in this.state.gameData.rooms) ) {
        r = <GameOver par={this} text={"404:\nYou fell off the edge of the game"}/>
      }
      else {
        r = <RoomView par={this} roomDesc={(this.state.displayType === "room") ? this.state.roomDesc : " "} inv={(this.state.displayType === "room") ? this.state.realInv : [" "]} opt={(this.state.displayType === "room") ? this.state.roomOpts : [" "]} />
      }
    }
    return (
        r
    );
  }
}

const styles = StyleSheet.create({
  roomDescription: {
    fontFamily: monospace,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  roomDescriptionCont: {
    flex: 3,
    borderRightWidth: 5
  },
  invContainer: {
    flex: 2,
    backgroundColor: "blue"
  },
  roomInvCont: {
    flex: 0,
    minHeight: 200,
    flexDirection: 'row'
  },
  choices: {
    backgroundColor: 'yellow'
  },
  menuItem: {
    fontFamily: monospace,
    backgroundColor: 'yellow',
    color: 'blue',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    backgroundColor: '#000000',
  },
  gameOverMenu: {
    flex: 0
  },
  gameOver: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gameOverText: {
    backgroundColor: 'blue',
    textAlign: 'center',
    color: 'white',
    fontFamily: monospace,
    fontWeight: 'bold',
    fontSize: 30
  },
  gameOverTextCont: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'blue'
  },
  gameTitle:{
    fontFamily: monospace,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center'
  },
  gameAuthors: {
    fontFamily: monospace,
    fontWeight: 'bold',
    fontSize: 17,
    color: 'white',
    textAlign: 'center'
  },
  gameDesc: {
    fontFamily: monospace,
    fontWeight: 'bold',
    fontSize: 15,
    color: 'white',
    textAlign: 'center'
  },
  titleContMain: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  titleCont: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10
  }
});

AppRegistry.registerComponent('AVEmobile', () => AVEmobile);

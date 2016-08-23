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
  Platform,
  Image,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';

bgColor = "#2f0923"
blue = "#32619e"
red = "#cc0000"
green = "#4d9906"

scrollHeightPort = 150
scrollHeightLand = 130

dim = Dimensions.get('window')

screenHeight = Math.max(dim.height, dim.width)
screenWidth = Math.min(dim.height, dim.width)

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
      dataSourceOpt: this.ds_opt.cloneWithRows(this.props.opt),
      layout: {}
    };
  }
  render() {
    dataSourceOpt = this.ds_opt.cloneWithRows(this.props.opt)
    dataSourceInv = this.ds_inv.cloneWithRows(this.props.inv)
    /*var window = Dimensions.get('window')*/
    var window = this.state.layout
    var scrollHeight = (window.width > window.height) ? scrollHeightLand : scrollHeightPort
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      <StatusBar hidden={true} />
      <TopBar  par={this.props.par} />
        <View style={[styles.roomInvCont,{height:window.height - 20 - scrollHeight - 5}]}>
          <View style={styles.roomDescriptionCont}>
            <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={styles.roomDescription}>{this.props.roomDesc}</Text>
            </ScrollView>
          </View>
          <View style={[styles.invContainer,{maxHeight: 300}]}>
            <Text style={styles.roomDescription}>INVENTORY</Text>
            <ScrollView showsVerticalScrollIndicator={true}>
            <ListView
              dataSource={dataSourceInv}
              renderRow={(rowData) => <Text style={styles.roomDescription}>{rowData}</Text>}
            />
            </ScrollView>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={true} style={{flex:0, height: scrollHeight, backgroundColor: 'yellow'}} ref={(ref) => {this.myScroll = ref;}}>
          <ListView
           dataSource={dataSourceOpt}
           renderRow={this._renderRow.bind(this)}
           renderSeparator={(sectionId, rowId) => <View key={rowId} style={[styles.separator,{width: window.width - 20, marginLeft: 10}]}/>}
          />
        </ScrollView>
      </View>
  )
  }
  appLayout(orient) {
    this.setState({layout: orient})
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
    this.state = {layout: {}}
  }
  render() {
    var window = this.state.layout
    return(
    <View onLayout={event => this.appLayout(event.nativeEvent.layout)} style={styles.container}>
    <TopBar par={this.props.par} />
    <StatusBar hidden={true} />
    <View style={styles.titleContParent}>
      <View style={styles.titleCont}>
        <Text style={styles.gameTitle}>
          {this.props.title}
        </Text>
      </View>
      <View style={[styles.titleCont,{paddingBottom:30}]}>
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
        <View style={[styles.separator,{width: window.width - 20, marginLeft: 10}]}/>
        <TouchableHighlight onPress={()=>this.props.par._startAgain()}>
          <Text style={styles.menuItem}>
            Main menu
          </Text>
        </TouchableHighlight>
      </View>
    </View>
  )
  }
  appLayout(orient) {
    this.setState({layout: orient})
  }
}

class GameOver extends Component {
  constructor(props) {
    super(props)
    this.state = {layout: {}}
  }
  reload(again) {
    this.props.par._onPressGameOver(again)
  }
  render() {
    var window = this.state.layout
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      <TopBar par={this.props.par} />
      <StatusBar hidden={true} />
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
          <View style={[styles.separator,{width: window.width - 20, marginLeft: 10}]}/>
          <TouchableHighlight onPress={()=>this.reload(false)}>
            <Text style={styles.menuItem}>
              Play a different game
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
  appLayout(orient) {
    this.setState({layout: orient})
  }
}

class BannerImage extends Component {
  constructor(props) {
    super(props)
    var window = this.props.par.state.layout
    var landscape = window.width>window.height
    this.state = {land: landscape}
  }
  appLayout(orient) {
    var window = this.props.lay
    var landscape = window.width>window.height
    this.setState({land: landscape, imgHeight: orient.height})
  }
  render() {
    if (Platform.OS === "ios") {
      if (this.props.par.state.layout.height == null ) {
        var bannerloc = 'a'
      }
      else {
        var bannerloc = (this.props.par.state.land) ? 'bannerlandscape.png' : 'bannerportrait.png';
      }
      var banner = {uri: bannerloc}
      var imgStyle = {flex: 1, maxHeight: this.props.par.land ? screenWidth/3 : screenHeight/3}
    }
    else {
      if (this.props.par.state.layout.height == null ) {
        var banner = {uri: 'a'}
      }
      else {
        var banner = (this.props.par.state.land || this.props.par.state.layout.height < 400 ) ? require('./bannerlandscape.png') : require('./bannerportrait.png')
      }
      var imgStyle = {flex: 1, height: this.state.imgHeight, width: window.width}
    }
    console.log(this.props.par.state.land)
    console.log(banner)
    return (
      <View style={{flex: 1, maxHeight: this.props.par.land ? screenWidth/3 : screenHeight/3, width: window.width, minHeight: (this.props.par.state.layout.height > 320) ? 100 : 70, flexDirection: 'row', justifyContent: 'flex-start'}} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
        <Image source={banner} resizeMode='contain' style={imgStyle} />
      </View>
    )
  }
}

class TopBar extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View style={styles.topBar}>
      <TouchableHighlight onPress={()=>{this.props.par._startAgain()}}>
        <Text style={[styles.roomDescription]}>
        Main Menu
        </Text>
      </TouchableHighlight>
      <View style={{flexDirection: 'row'}}>
      <Text style={[styles.roomDescription, {color:red}]}>
        A
      </Text>
      <Text style={[styles.roomDescription, {color:green}]}>
        V
      </Text>
      <Text style={[styles.roomDescription, {color:blue}]}>
        E
      </Text>
      </View>
      </View>
    )
  }
}

class MenuScreen extends Component {
  constructor(props) {
    super(props)
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.banner = <BannerImage par={this}/>
    this.state = {layout: {}, land: true}
  }
  touchable(g) {
    if ("gameInfo" in g && "title" in g.gameInfo ) {
        t = g.gameInfo.title
      }
    else {
        t = "Title missing"
      }
    return (
      <TouchableHighlight onPress={()=>this.props.par._loadGame(g)}>
        <Text style={styles.menuItem}>
          {t}
        </Text>
      </TouchableHighlight>
    )
  }
  render() {
    dataSource = this.ds.cloneWithRows(this.props.games)
    var window = this.state.layout
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      <StatusBar hidden={true} />
      <View style={styles.topBar}>
        <TouchableHighlight>
          <Text style={[styles.roomDescription]}>Download more games</Text>
        </TouchableHighlight>
        <View style={{flexDirection: 'row'}}>
        <Text style={[styles.roomDescription, {color:red}]}>
          A
        </Text>
        <Text style={[styles.roomDescription, {color:green}]}>
          V
        </Text>
        <Text style={[styles.roomDescription, {color:blue}]}>
          E
        </Text>
        </View>
      </View>
      <View style={{flex: 1, paddingLeft: 5, paddingRight: 5}} >
        <BannerImage par={this} lay={this.state.layout}/>
        <View style={{height: this.state.land ? 0 : 20}} />
        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
        <Text style={[styles.roomDescription, {color:red}]}>
          A
        </Text>
        <Text style={[styles.roomDescription, {color:green}]}>
          V
        </Text>
        <Text style={[styles.roomDescription, {color:blue}]}>
          E
        </Text>
        <Text style={styles.roomDescription}>
          :
        </Text>
        <View style={{flexDirection: 'column'}}>
        <Text style={styles.roomDescription}>
        {(this.state.layout.width< 330) ? "Adventure! Villainy! \nExcitement!" : "Adventure! Villainy! Excitement!"}
        </Text>
        </View>
        </View>
        <Text style={[styles.roomDescription, {textAlign:'right'}]}>
          A text-based game engine written by Gin Grasso & Matthew Scroggs.
        </Text>
        <Text style={[styles.roomDescription, {textAlign:'right'}]}>
          AVEgame.co.uk
        </Text>
        <Text style={[styles.roomDescription, {textAlign:'right'}]}>
          github.com/AVEgame/AVE
        </Text>
        <View style={{height: 20}} />
      </View>
        <ScrollView showsVerticalScrollIndicator={true} style={{flex: 0, height: this.state.land ? screenWidth/3 : screenHeight/3, backgroundColor: 'yellow'}}>
        <ListView
          dataSource={dataSource}
          renderRow={(rowData) => this.touchable(JSON.parse(rowData[1]))}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={[styles.separator,{width: window.width - 20, marginLeft: 10}]}/>}
        />
        </ScrollView>
      </View>
    )
  }
  appLayout(orient) {
    this.setState({layout: orient, land: orient.width > orient.height })
  }
}

/*<TouchableHighlight id="tea" onPress={()=>this.props.par._loadGame('@AVEgameData:tea')}>
  <Text style={styles.menuItem}>
    Wonderful tea journey
  </Text>
</TouchableHighlight>*/

export default class AVEmobile extends Component {
  constructor() {
    super()
    this._onPressButton = this._onPressButton.bind(this);
    this._start = this._start.bind(this);
    this._prepareData();
    this.state = {displayType: "none", roomId: "start", inventory: [], realInv: [" "], gameList: [[" ",{}]]}
  }
  async _prepareData() {
    AsyncStorage.getAllKeys((err,keys)=>{this._storeIfNeeded(err, keys)})
  }
  async _storeIfNeeded(err,keys) {
    if (keys.length === 0) {
      var teaDataJSON = require('./tea.json')
      var teaDataStr = JSON.stringify(teaDataJSON)
      var butterDataJSON = require('./butterfield.json')
      var butterDataStr = JSON.stringify(butterDataJSON)
      AsyncStorage.multiSet([[storageKey + 'butterfield',butterDataStr],[storageKey + "tea", teaDataStr]], (err)=>{this._start()})
    }
    else {
      this._start()
    }
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
  _menu(err, keyList) {
    this.setState({displayType: "menu", roomId: "start", inventory: [], realInv: [" "], gameList: keyList})
  }
  async _start() {
    AsyncStorage.getAllKeys((err,keys)=> {AsyncStorage.multiGet(keys, this._menu.bind(this))})
  }
  _loadGame(game) {
    this.setState({gameData: game})
    this._showTitle()
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
    if (this.state.displayType === "none" ) {
      r = <View style={styles.container} />
    }
    else if ( this.state.displayType === "menu" ) {
      r = <MenuScreen games={this.state.gameList} par={this}/>
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
    paddingRight: 5,
    paddingLeft: 5
  },
  invContainer: {
    flex: 2,
    backgroundColor: "blue",
    paddingLeft: 3,
    paddingRight: 3
  },
  roomInvCont: {
    flex: 0,
    flexDirection: 'row'
  },
  choices: {
    backgroundColor: 'yellow'
  },
  menuItem: {
    fontFamily: monospace,
    backgroundColor: 'yellow',
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: bgColor,
  },
  gameOverMenu: {
    flex: 0,
    backgroundColor: 'yellow'
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
    paddingLeft: 10,
    minHeight: 30
  },
  roomScroll: {
    flex:0,
    height: 115,
    backgroundColor: 'yellow'
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: bgColor,
    opacity: 0.3
  },
  topBar: {
    flexDirection:'row',
    height: 20,
    paddingRight: 5,
    paddingLeft: 5,
    backgroundColor:'rgba(100,100,100,0.3)',
    justifyContent: 'space-between'
  }
});

AppRegistry.registerComponent('AVEmobile', () => AVEmobile);

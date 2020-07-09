import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform,
  Image,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';

const bgColor = "#2f0923";
const blue = "#32619e";
const red = "#cc0000";
const green = "#4d9906";
const monospace = (Platform.OS === "ios") ? "Courier New" : "monospace";

var dim = Dimensions.get('window');

const screenHeight = Math.max(dim.height, dim.width)
const screenWidth = Math.min(dim.height, dim.width)

const scrollHeightPort = 150
const scrollHeightLand = 130

const BaseUrl = "https://avegame.co.uk/"


export default class AVEmobile extends Component {
  constructor() {
    super()
    this._refreshGames = this._refreshGames.bind(this);
    this._startAgain = this._startAgain.bind(this);
    this._startGame = this._startGame.bind(this);
    this._getRoom = this._getRoom.bind(this);
    this.state = {
      displayType: "menu",
      roomId: "start",
      inventory: [],
      gameList: [],
      numbers: {},
      roomDesc: "",
      request: null,
      gameData: null,
      inventoryText: [],
    };
    this._refreshGames();
  }
  render() {
    var r;
    if (this.state.displayType === "menu") {
      r = <MenuScreen games={this.state.gameList} par={this}/>;
    }
    else if (this.state.displayType === "title") {
      var gameInfo = this.state.gameData;
      r = <GameTitle par={this} title={gameInfo.title} author={gameInfo.author} description={gameInfo.desc}/>
    }
    else if (this.state.displayType === "game") {
      r = <RoomView par={this}/>
    }
    else if (this.state.displayType === "gameover") {
      r = <GameOver par={this}/>
    }
    else if (this.state.displayType === "error") {
      r = <ErrorView par={this}/>
    }
    return (
        r
    );
  }
  _refreshGames() {
    if (!(this.state.request == null) && !(this.state.request.DONE)) {
      this.state.request.abort()
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        var gameListFull = JSON.parse(request.responseText);
        var gameList = Array()
        for (var i=0; i<gameListFull.length; i++) {
          if (gameListFull[i].active) {
            gameList.push(gameListFull[i]);
          }
        }
        this.setState({gameList: gameList});
      }
      else {
        this.setState({displayType: "error"})
      }
    }
    request.open('GET', BaseUrl + 'gamelist.json');
    request.send();
  }
  _loadGame(game) {
    this.setState({displayType: "title", gameData: game});
  }
  _startAgain() {
    this.setState({
      displayType: "menu",
      roomId: "start",
      inventory: [],
      numbers: {},
      request: null,
      gameData: null,
      roomDesc: "",
      inventoryText: "",
    });
    this._refreshGames();
  }
  _startGame() {
    this._getRoom(null);
  }
  _getRoom(option) {
    var data = {
      inventory: this.state.inventory,
      numbers: this.state.numbers,
      current_room: this.state.roomId,
      option: option,
    };
    var request = new XMLHttpRequest();
    var url = BaseUrl + 'play/';
    if (this.state.gameData.user) {
      url += "user/";
    }
    url += this.state.gameData.filename;
    request.open('POST', url, true);
    request.setRequestHeader( "Content-Type", "application/json" );
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        var roomData = JSON.parse(request.responseText);
        if (roomData.room === "__GAMEOVER__") {
          this.setState({
            displayType: "gameover",
            roomDesc: "GAME OVER"
          })
        }
        else if (roomData.room === "__WINNER__") {
          this.setState({
            displayType: "gameover",
            roomDesc: "YOU WIN!"
          })
        }
        else {
          this.setState({
            inventory: roomData.inventory,
            roomId: roomData.room,
            numbers: roomData.numbers,
            roomDesc: roomData.room_desc,
            options: roomData.options,
            displayType: "game",
            inventoryText: roomData.inventory_text
          })
        }
      }
      else {
        this.setState({displayType: "error"})
      }
    }
    request.send(JSON.stringify(data));
  }
  _onPressGameOver(again) {
    if (again) {
      this._startGame();
    }
    else {
      this._startAgain();
    }
  }
}

class MenuScreen extends Component {
  constructor(props) {
    super(props)
    this.banner = <BannerImage par={this}/>
    this.state = {layout: {}, land: false}
  }
  touchable(game) {
    var t = game.title
    return (
      <TouchableHighlight onPress={()=>this.props.par._loadGame(game)}>
        <Text style={styles.menuItem}>
          {t}
        </Text>
      </TouchableHighlight>
    )
  }
  render() {
    // dataSource = this.ds.cloneWithRows(this.props.games)
    var window = this.state.layout
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      <StatusBar hidden={true} />
      <View style={styles.topBar}>
        <TouchableHighlight onPress={()=>this.props.par._refreshGames()}>
          <Text style={[styles.roomDescription]}>Refresh Game List</Text>
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
        <Text style={[styles.roomDescription, {paddingBottom: 3}]}>
        {(this.state.layout.width< 330) ? "Adventure! Villainy! \nExcitement!" : "Adventure! Villainy! Excitement!"}
        </Text>
        </View>
        </View>
        <Text style={[styles.roomDescription, {textAlign:'left', paddingBottom: 5}]}>
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
        {/* <ScrollView showsVerticalScrollIndicator={true} style={{flex: 0, height: this.state.land ? screenWidth/3 : screenHeight/3, backgroundColor: 'yellow'}}> */}
        <View style={{flex: 0, height: this.state.land ? screenWidth/3 : screenHeight/3, backgroundColor: 'yellow'}}>
          <FlatList
            data={this.props.par.state.gameList}
            renderItem={(game) => this.touchable(game.item)}
            keyExtractor={(game) => game.filename}
            // renderSeparator={(sectionId, rowId) => <View key={rowId} style={[styles.separator,{width: window.width - 20, marginLeft: 10}]}/>}
          />
          {/* </ScrollView> */}
        </View>
        </View>
    )
  }
  appLayout(orient) {
    this.setState({layout: orient, land: orient.width > orient.height });
  }
}

class RoomView extends Component {
  constructor(props) {
    super(props);
    this.state = {land: false}
  }
  render() {
    var window = Dimensions.get('window')
    var scrollHeight = (window.width > window.height) ? scrollHeightLand : scrollHeightPort
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      <StatusBar hidden={true} />
      {/* <TopBar  par={this.props.par} /> */}
        <View style={[styles.roomInvCont,{height:window.height - 20 - scrollHeight - 5}]}>
          <View style={styles.roomDescriptionCont}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <Text style={styles.roomDescription}>{this.props.par.state.roomDesc}</Text>
            </ScrollView>
          </View>
            <View style={[styles.invContainer,{maxHeight: 300}]}>
              <Text style={styles.roomDescription}>INVENTORY</Text>
              <View style={{flex: 0}}>
                <FlatList
                  data={this.props.par.state.inventoryText}
                  renderItem={(item) => this._inventoryRow(item)}
                  keyExtractor={(item) => this._inventoryKey(item)}
                />
              </View>
            </View>
        </View>
        <View showsVerticalScrollIndicator={true} style={{flex:0, height: scrollHeight, backgroundColor: 'yellow'}}>
          <FlatList
           data={this.props.par.state.options}
           renderItem={(option) => this._optionRow.bind(this)(option)}
           keyExtractor={(option) => this._optionKey(option)}
          />
        </View>
      </View>
  )
  }
  _inventoryKey(item) {
    return (item);
  }
  _inventoryRow(item) {
    return (
      <Text style={styles.roomDescription}>{item.item}</Text>
    );
  }
  appLayout(orient) {
    this.setState({layout: orient})
  }
  _optionRow(option) {
    return (
      <TouchableHighlight onPress={()=>this.props.par._getRoom(option.item[0])}>
        <Text style={styles.menuItem}>
          {option.item[1]}
        </Text>
      </TouchableHighlight>
    );
  }
  _optionKey(option) {
    return (option[0].toString());
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
    var window = Dimensions.get('window');
    return(
    <View onLayout={event => this.appLayout(event.nativeEvent.layout)} style={styles.container}>
    {/* <TopBar par={this.props.par} /> */}
    <StatusBar hidden={true} />
    <View style={styles.titleContParent}>
      <View style={styles.titleCont}>
        <Text style={styles.gameTitle}>
          {this.props.title}
        </Text>
      </View>
      {/* <View style={[styles.titleCont,{paddingBottom:30}]}> */}
      <View style={styles.titleCont}>
        <Text style={styles.gameAuthors}>
          {"By: " + this.props.author}
        </Text>
      </View>
      {/* <View style={styles.titleCont}> */}
        <View style={{flexDirection: "row", padding: 10}}>
          <Text style={styles.gameDesc}>
            {this.props.description}
          </Text>
        </View>
      {/* </View> */}
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

class BannerImage extends Component {
  constructor(props) {
    super(props)
    var window = this.props.par.state.layout
    var landscape = window.width>window.height
    this.state = {land: landscape, imgHeight: 10000}
  }
  appLayout(orient) {
    var window = this.props.lay
    var landscape = window.width>window.height
    this.setState({land: landscape, imgHeight: orient.height})
  }
  render() {
    var banner = (this.props.par.state.land) ? require('./bannerlandscape.png') : require('./bannerportrait.png');
    var imgStyle = {flex: 1, maxHeight: this.props.par.state.land ? Math.min(screenWidth/3, this.state.imgHeight) : Math.min(screenHeight * 0.4, this.state.imgHeight)};
    return (
      <View style={{flex: 1, maxHeight: this.props.par.state.land ? screenWidth/3 : screenHeight * 0.4, width: window.width, minHeight: (this.props.par.state.layout.height > 320) ? 100 : 70, flexDirection: 'row', justifyContent: 'flex-start'}} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
        <Image source={banner} resizeMode='contain' style={imgStyle} />
      </View>
    )
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
    var window = Dimensions.get('window');
    return(
      <View style={styles.container} onLayout={event => this.appLayout(event.nativeEvent.layout)}>
      {/* <TopBar par={this.props.par} /> */}
      <StatusBar hidden={true} />
        <View style={styles.gameOver}>
          <View style={styles.gameOverTextCont}>
            <Text style={styles.gameOverText}>{this.props.par.state.roomDesc}</Text>
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

class ErrorView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleContParent}>
          <View style={styles.titleCont}>
            <Text style={styles.gameTitle}>
              ERROR
            </Text>
          </View>
          <View style={{flexDirection: "row", padding: 10}}>
            <Text style={styles.gameDesc}>
              Error communicating with https://avegame.co.uk. Check your connection.
            </Text>
          </View>
        </View>
      {/* <TopBar par={this.props.par} /> */}
        <StatusBar hidden={true} />
        <View style={styles.gameOverMenu}>
          <TouchableHighlight onPress={()=>this.props.par._startAgain()}>
            <Text style={styles.menuItem}>
              Try again
            </Text>
          </TouchableHighlight>
        </View>
      </View>
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
    flexDirection: "column",
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
    textAlign: 'center',
    flexShrink: 1,
    flexDirection: 'row'
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
    textAlign: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  titleContMain: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  titleCont: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
    minHeight: 30,
    flexDirection: "column",
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
    backgroundColor:'rgba(100,100,100,0.5)',
    justifyContent: 'space-between'
  }
});

registerRootComponent(AVEmobile);
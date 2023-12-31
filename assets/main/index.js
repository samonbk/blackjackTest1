window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ActorRenderer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1a792KO87NBg7vCCIp1jq+j", "ActorRenderer");
    "use strict";
    var Game = require("Game");
    var Types = require("Types");
    var Utils = require("Utils");
    var ActorPlayingState = Types.ActorPlayingState;
    cc.Class({
      extends: cc.Component,
      properties: {
        playerInfo: cc.Node,
        stakeOnTable: cc.Node,
        cardInfo: cc.Node,
        cardPrefab: cc.Prefab,
        anchorCards: cc.Node,
        spPlayerName: cc.Sprite,
        labelPlayerName: cc.Label,
        labelTotalStake: cc.Label,
        spPlayerPhoto: cc.Sprite,
        callCounter: cc.ProgressBar,
        labelStakeOnTable: cc.Label,
        spChips: {
          default: [],
          type: cc.Sprite
        },
        labelCardInfo: cc.Label,
        spCardInfo: cc.Sprite,
        animFX: cc.Node,
        cardSpace: 0
      },
      onLoad: function onLoad() {},
      init: function init(playerInfo, playerInfoPos, stakePos, turnDuration, switchSide) {
        this.actor = this.getComponent("Actor");
        this.isCounting = false;
        this.counterTimer = 0;
        this.turnDuration = turnDuration;
        this.playerInfo.position = playerInfoPos;
        this.stakeOnTable.position = stakePos;
        this.labelPlayerName.string = playerInfo.name;
        this.updateTotalStake(playerInfo.gold);
        var photoIdx = playerInfo.photoIdx % 5;
        this.spPlayerPhoto.spriteFrame = Game.instance.assetMng.playerPhotos[photoIdx];
        this.animFX = this.animFX.getComponent("FXPlayer");
        this.animFX.init();
        this.animFX.show(false);
        this.cardInfo.active = false;
        if (switchSide) {
          this.spCardInfo.getComponent("SideSwitcher").switchSide();
          this.spPlayerName.getComponent("SideSwitcher").switchSide();
        }
      },
      update: function update(dt) {
        if (this.isCounting) {
          this.callCounter.progress = this.counterTimer / this.turnDuration;
          this.counterTimer += dt;
          if (this.counterTimer >= this.turnDuration) {
            this.isCounting = false;
            this.callCounter.progress = 1;
          }
        }
      },
      initDealer: function initDealer() {
        this.actor = this.getComponent("Actor");
        this.animFX = this.animFX.getComponent("FXPlayer");
        this.animFX.init();
        this.animFX.show(false);
      },
      updateTotalStake: function updateTotalStake(num) {
        this.labelTotalStake.string = "$" + num;
      },
      startCountdown: function startCountdown() {
        if (this.callCounter) {
          this.isCounting = true;
          this.counterTimer = 0;
        }
      },
      resetCountdown: function resetCountdown() {
        if (this.callCounter) {
          this.isCounting = false;
          this.counterTimer = 0;
          this.callCounter.progress = 0;
        }
      },
      playBlackJackFX: function playBlackJackFX() {
        this.animFX.playFX("blackjack");
      },
      playBustFX: function playBustFX() {
        this.animFX.playFX("bust");
      },
      onDeal: function onDeal(card, show) {
        var newCard = cc.instantiate(this.cardPrefab).getComponent("Card");
        this.anchorCards.addChild(newCard.node);
        newCard.init(card);
        newCard.reveal(show);
        var startPos = cc.v2(0, 0);
        var index = this.actor.cards.length - 1;
        var endPos = cc.v2(this.cardSpace * index, 0);
        newCard.node.setPosition(startPos);
        this._updatePointPos(endPos.x);
        var moveAction = cc.moveTo(.5, endPos);
        var callback = cc.callFunc(this._onDealEnd, this);
        newCard.node.runAction(cc.sequence(moveAction, callback));
      },
      _onDealEnd: function _onDealEnd(target) {
        this.resetCountdown();
        this.actor.state === ActorPlayingState.Normal && this.startCountdown();
        this.updatePoint();
      },
      onReset: function onReset() {
        this.cardInfo.active = false;
        this.anchorCards.removeAllChildren();
        this._resetChips();
      },
      onRevealHoldCard: function onRevealHoldCard() {
        var card = cc.find("cardPrefab", this.anchorCards).getComponent("Card");
        card.reveal(true);
        this.updateState();
      },
      updatePoint: function updatePoint() {
        this.cardInfo.active = true;
        this.labelCardInfo.string = this.actor.bestPoint;
        switch (this.actor.hand) {
         case Types.Hand.BlackJack:
          this.animFX.show(true);
          this.animFX.playFX("blackjack");
          break;

         case Types.Hand.FiveCard:
        }
      },
      _updatePointPos: function _updatePointPos(xPos) {
        this.cardInfo.setPosition(xPos + 50, 0);
      },
      showStakeChips: function showStakeChips(stake) {
        var chips = this.spChips;
        var count = 0;
        stake > 5e4 ? count = 5 : stake > 25e3 ? count = 4 : stake > 1e4 ? count = 3 : stake > 5e3 ? count = 2 : stake > 0 && (count = 1);
        for (var i = 0; i < count; ++i) chips[i].enabled = true;
      },
      _resetChips: function _resetChips() {
        for (var i = 0; i < this.spChips.length; ++i) this.spChips.enabled = false;
      },
      updateState: function updateState() {
        switch (this.actor.state) {
         case ActorPlayingState.Normal:
          this.cardInfo.active = true;
          this.spCardInfo.spriteFrame = Game.instance.assetMng.texCardInfo;
          this.updatePoint();
          break;

         case ActorPlayingState.Bust:
          var min = Utils.getMinMaxPoint(this.actor.cards).min;
          this.labelCardInfo.string = "bust(" + min + ")";
          this.spCardInfo.spriteFrame = Game.instance.assetMng.texBust;
          this.cardInfo.active = true;
          this.animFX.show(true);
          this.animFX.playFX("bust");
          this.resetCountdown();
          break;

         case ActorPlayingState.Stand:
          var max = Utils.getMinMaxPoint(this.actor.cards).max;
          this.labelCardInfo.string = "suspension(" + max + ")";
          this.spCardInfo.spriteFrame = Game.instance.assetMng.texCardInfo;
          this.resetCountdown();
        }
      }
    });
    cc._RF.pop();
  }, {
    Game: "Game",
    Types: "Types",
    Utils: "Utils"
  } ],
  Actor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7d008dTf6xB2Z0wCAdzh1Rx", "Actor");
    "use strict";
    var Types = require("Types");
    var Utils = require("Utils");
    var ActorPlayingState = Types.ActorPlayingState;
    cc.Class({
      extends: cc.Component,
      properties: {
        cards: {
          default: [],
          serializable: false,
          visible: false
        },
        holeCard: {
          default: null,
          serializable: false,
          visible: false
        },
        bestPoint: {
          get: function get() {
            var minMax = Utils.getMinMaxPoint(this.cards);
            return minMax.max;
          }
        },
        hand: {
          get: function get() {
            var count = this.cards.length;
            this.holeCard && ++count;
            if (count >= 5) return Types.Hand.FiveCard;
            if (2 === count && 21 === this.bestPoint) return Types.Hand.BlackJack;
            return Types.Hand.Normal;
          }
        },
        canReport: {
          get: function get() {
            return this.hand !== Types.Hand.Normal;
          },
          visible: false
        },
        renderer: {
          default: null,
          type: cc.Node
        },
        state: {
          default: ActorPlayingState.Normal,
          notify: function notify(oldState) {
            this.state !== oldState && this.renderer.updateState();
          },
          type: ActorPlayingState,
          serializable: false
        }
      },
      init: function init() {
        this.ready = true;
        this.renderer = this.getComponent("ActorRenderer");
      },
      addCard: function addCard(card) {
        this.cards.push(card);
        this.renderer.onDeal(card, true);
        var cards = this.holeCard ? [ this.holeCard ].concat(this.cards) : this.cards;
        Utils.isBust(cards) && (this.state = ActorPlayingState.Bust);
      },
      addHoleCard: function addHoleCard(card) {
        this.holeCard = card;
        this.renderer.onDeal(card, false);
      },
      stand: function stand() {
        this.state = ActorPlayingState.Stand;
      },
      revealHoldCard: function revealHoldCard() {
        if (this.holeCard) {
          this.cards.unshift(this.holeCard);
          this.holeCard = null;
          this.renderer.onRevealHoldCard();
        }
      },
      report: function report() {
        this.state = ActorPlayingState.Report;
      },
      reset: function reset() {
        this.cards = [];
        this.holeCard = null;
        this.reported = false;
        this.state = ActorPlayingState.Normal;
        this.renderer.onReset();
      }
    });
    cc._RF.pop();
  }, {
    Types: "Types",
    Utils: "Utils"
  } ],
  AssetMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "54522LcoVpPHbrqYgwp/1Qm", "AssetMng");
    "use strict";
    var AssetMng = cc.Class({
      extends: cc.Component,
      properties: {
        texBust: cc.SpriteFrame,
        texCardInfo: cc.SpriteFrame,
        texCountdown: cc.SpriteFrame,
        texBetCountdown: cc.SpriteFrame,
        playerPhotos: [ cc.SpriteFrame ]
      }
    });
    cc._RF.pop();
  }, {} ],
  AudioMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "01ca4tStvVH+JmZ5TNcmuAu", "AudioMng");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        winAudio: {
          default: null,
          type: cc.AudioClip
        },
        loseAudio: {
          default: null,
          type: cc.AudioClip
        },
        cardAudio: {
          default: null,
          type: cc.AudioClip
        },
        buttonAudio: {
          default: null,
          type: cc.AudioClip
        },
        chipsAudio: {
          default: null,
          type: cc.AudioClip
        },
        bgm: {
          default: null,
          type: cc.AudioClip
        }
      },
      playMusic: function playMusic() {
        cc.audioEngine.playMusic(this.bgm, true);
      },
      pauseMusic: function pauseMusic() {
        cc.audioEngine.pauseMusic();
      },
      resumeMusic: function resumeMusic() {
        cc.audioEngine.resumeMusic();
      },
      _playSFX: function _playSFX(clip) {
        cc.audioEngine.playEffect(clip, false);
      },
      playWin: function playWin() {
        this._playSFX(this.winAudio);
      },
      playLose: function playLose() {
        this._playSFX(this.loseAudio);
      },
      playCard: function playCard() {
        this._playSFX(this.cardAudio);
      },
      playChips: function playChips() {
        this._playSFX(this.chipsAudio);
      },
      playButton: function playButton() {
        this._playSFX(this.buttonAudio);
      }
    });
    cc._RF.pop();
  }, {} ],
  Bet: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "28f38yToT1Pw7NgyeCvRxDC", "Bet");
    "use strict";
    var Game = require("Game");
    var AudioManager = require("audioManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        chipPrefab: cc.Prefab,
        btnChips: {
          default: [],
          type: cc.Node
        },
        chipValues: {
          default: [],
          type: cc.Integer
        },
        anchorChipToss: cc.Node
      },
      init: function init() {
        this._registerBtns();
      },
      _registerBtns: function _registerBtns() {
        var self = this;
        var registerBtn = function registerBtn(index) {
          self.btnChips[i].on("touchstart", function(event) {
            Game.instance.addStake(self.chipValues[index]) && self.playAddChip();
          }, this);
        };
        for (var i = 0; i < self.btnChips.length; ++i) registerBtn(i);
      },
      playAddChip: function playAddChip() {
        var startPos = cc.v2(2 * (Math.random() - .5) * 50, 2 * (Math.random() - .5) * 50);
        var chip = cc.instantiate(this.chipPrefab);
        this.anchorChipToss.addChild(chip);
        chip.setPosition(startPos);
        chip.getComponent("TossChip").play();
      },
      resetChips: function resetChips() {
        AudioManager.instance.PlaySFX("buttonsound");
        Game.instance.resetStake();
        Game.instance.info.enabled = false;
        this.resetTossedChips();
      },
      resetTossedChips: function resetTossedChips() {
        this.anchorChipToss.removeAllChildren();
      }
    });
    cc._RF.pop();
  }, {
    Game: "Game",
    audioManager: "audioManager"
  } ],
  ButtonScaler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a171dSnCXFMRIqs1IWdvgWM", "ButtonScaler");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        pressedScale: 1,
        transDuration: .5
      },
      onLoad: function onLoad() {
        var self = this;
        var audioMng = cc.find("Menu/AudioMng") || cc.find("Game/AudioMng");
        audioMng && (audioMng = audioMng.getComponent("AudioMng"));
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown(event) {
          this.stopAllActions();
          this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event) {
          this.stopAllActions();
          this.runAction(self.scaleUpAction);
        }
        this.node.on("touchstart", onTouchDown, this.node);
        this.node.on("touchend", onTouchUp, this.node);
        this.node.on("touchcancel", onTouchUp, this.node);
      }
    });
    cc._RF.pop();
  }, {} ],
  Card: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ab67e5QkiVCBZ3DIMlWhiAt", "Card");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        point: cc.Label,
        suit: cc.Sprite,
        mainPic: cc.Sprite,
        cardBG: cc.Sprite,
        redTextColor: cc.Color.WHITE,
        blackTextColor: cc.Color.WHITE,
        texFrontBG: cc.SpriteFrame,
        texBackBG: cc.SpriteFrame,
        texFaces: {
          default: [],
          type: cc.SpriteFrame
        },
        texSuitBig: {
          default: [],
          type: cc.SpriteFrame
        },
        texSuitSmall: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      init: function init(card) {
        var isFaceCard = card.point > 10;
        this.mainPic.spriteFrame = isFaceCard ? this.texFaces[card.point - 10 - 1] : this.texSuitBig[card.suit - 1];
        this.point.string = card.pointName;
        card.isRedSuit ? this.point.node.color = this.redTextColor : this.point.node.color = this.blackTextColor;
        this.suit.spriteFrame = this.texSuitSmall[card.suit - 1];
      },
      reveal: function reveal(isFaceUp) {
        this.point.node.active = isFaceUp;
        this.suit.node.active = isFaceUp;
        this.mainPic.node.active = isFaceUp;
        this.cardBG.spriteFrame = isFaceUp ? this.texFrontBG : this.texBackBG;
      }
    });
    cc._RF.pop();
  }, {} ],
  Dealer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ce2dfoqEulHCLjS1Z9xPN7t", "Dealer");
    "use strict";
    var Actor = require("Actor");
    var Utils = require("Utils");
    cc.Class({
      extends: Actor,
      properties: {
        bestPoint: {
          get: function get() {
            var cards = this.holeCard ? [ this.holeCard ].concat(this.cards) : this.cards;
            var minMax = Utils.getMinMaxPoint(cards);
            return minMax.max;
          },
          override: true
        }
      },
      init: function init() {
        this._super();
        this.renderer.initDealer();
      },
      wantHit: function wantHit() {
        var Game = require("Game");
        var Types = require("Types");
        var bestPoint = this.bestPoint;
        if (21 === bestPoint) return false;
        if (bestPoint <= 11) return true;
        var player = Game.instance.player;
        var outcome = Game.instance._getPlayerResult(player, this);
        switch (outcome) {
         case Types.Outcome.Win:
          return true;

         case Types.Outcome.Lose:
          return false;
        }
        return this.bestPoint < 17;
      }
    });
    cc._RF.pop();
  }, {
    Actor: "Actor",
    Game: "Game",
    Types: "Types",
    Utils: "Utils"
  } ],
  Decks: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "17024G0JFpHcLI5GREbF8VN", "Decks");
    "use strict";
    var Types = require("Types");
    function Decks(numberOfDecks) {
      this._numberOfDecks = numberOfDecks;
      this._cardIds = new Array(52 * numberOfDecks);
      this.reset();
    }
    Decks.prototype.reset = function() {
      this._cardIds.length = 52 * this._numberOfDecks;
      var index = 0;
      var fromId = Types.Card.fromId;
      for (var i = 0; i < this._numberOfDecks; ++i) for (var cardId = 0; cardId < 52; ++cardId) {
        this._cardIds[index] = fromId(cardId);
        ++index;
      }
    };
    Decks.prototype.draw = function() {
      var cardIds = this._cardIds;
      var len = cardIds.length;
      if (0 === len) return null;
      var random = Math.random();
      var index = random * len | 0;
      var result = cardIds[index];
      var last = cardIds[len - 1];
      cardIds[index] = last;
      cardIds.length = len - 1;
      return result;
    };
    module.exports = Decks;
    cc._RF.pop();
  }, {
    Types: "Types"
  } ],
  FXPlayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "68da2yjdGVMSYhXLN9DukIB", "FXPlayer");
    "use strict";
    cc.Class({
      extends: cc.Component,
      init: function init() {
        this.anim = this.getComponent(cc.Animation);
        this.sprite = this.getComponent(cc.Sprite);
      },
      show: function show(_show) {
        this.sprite.enabled = _show;
      },
      playFX: function playFX(name) {
        this.anim.stop();
        this.anim.play(name);
      },
      hideFX: function hideFX() {
        this.sprite.enabled = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "63738OONCFKHqsf4QSeJSun", "Game");
    "use strict";
    var players = require("PlayerData").players;
    var Decks = require("Decks");
    var Types = require("Types");
    var ActorPlayingState = Types.ActorPlayingState;
    var Fsm = require("game-fsm");
    var AudioManager = require("audioManager");
    var Game = cc.Class({
      extends: cc.Component,
      properties: {
        playerAnchors: {
          default: [],
          type: cc.Node
        },
        playerPrefab: cc.Prefab,
        dealer: cc.Node,
        inGameUI: cc.Node,
        betUI: cc.Node,
        assetMng: cc.Node,
        turnDuration: 0,
        betDuration: 0,
        totalChipsNum: 0,
        totalDiamondNum: 0,
        numberOfDecks: {
          default: 1,
          type: cc.Integer
        },
        drop: {
          default: null,
          type: cc.Node
        },
        dropAnimation: {
          default: null,
          type: cc.Animation
        },
        youwinAnimation: {
          default: null,
          type: cc.Animation
        }
      },
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        Game.instance = this;
        this.inGameUI = this.inGameUI.getComponent("InGameUI");
        this.assetMng = this.assetMng.getComponent("AssetMng");
        this.betUI = this.betUI.getComponent("Bet");
        this.inGameUI.init(this.betDuration);
        this.betUI.init();
        this.dealer = this.dealer.getComponent("Dealer");
        this.dealer.init();
        this.player = null;
        this.createPlayers();
        this.info = this.inGameUI.resultTxt;
        this.totalChips = this.inGameUI.labelTotalChips;
        this.decks = new Decks(this.numberOfDecks);
        this.fsm = Fsm;
        this.fsm.init(this);
        this.updateTotalChips();
      },
      addStake: function addStake(delta) {
        if (this.totalChipsNum < delta) {
          console.log("not enough chips!");
          this.info.enabled = true;
          this.info.string = "Gold not enough!";
          return false;
        }
        this.totalChipsNum -= delta;
        this.updateTotalChips();
        this.player.addStake(delta);
        AudioManager.instance.PlaySFX("chipsound");
        this.info.enabled = false;
        this.info.string = "Please bet";
        return true;
      },
      resetStake: function resetStake() {
        this.totalChipsNum += this.player.stakeNum;
        this.player.resetStake();
        this.updateTotalChips();
      },
      updateTotalChips: function updateTotalChips() {
        this.totalChips.string = this.totalChipsNum;
        this.player.renderer.updateTotalStake(this.totalChipsNum);
      },
      createPlayers: function createPlayers() {
        var i = 2;
        var playerNode = cc.instantiate(this.playerPrefab);
        var anchor = this.playerAnchors[i];
        var switchSide = i > 2;
        anchor.addChild(playerNode);
        playerNode.position = cc.v2(0, 0);
        var playerInfoPos = cc.find("anchorPlayerInfo", anchor).getPosition();
        var stakePos = cc.find("anchorStake", anchor).getPosition();
        var actorRenderer = playerNode.getComponent("ActorRenderer");
        actorRenderer.init(players[i], playerInfoPos, stakePos, this.turnDuration, switchSide);
        this.player = playerNode.getComponent("Player");
        this.player.init();
      },
      hit: function hit() {
        AudioManager.instance.PlaySFX("buttonsound");
        this.player.addCard(this.decks.draw());
        this.player.state === ActorPlayingState.Bust && this.fsm.onPlayerActed();
      },
      stand: function stand() {
        this.player.stand();
        AudioManager.instance.PlaySFX("buttonsound");
        this.fsm.onPlayerActed();
      },
      deal: function deal() {
        this.fsm.toDeal();
        AudioManager.instance.PlaySFX("buttonsound");
      },
      start: function start() {
        this.fsm.toBet();
        AudioManager.instance.PlaySFX("buttonsound");
        AudioManager.instance.PlayMusic("BackgroundMusic");
      },
      report: function report() {
        this.player.report();
        this.fsm.onPlayerActed();
      },
      quitToMenu: function quitToMenu() {
        AudioManager.instance.PlaySFX("buttonsound");
        cc.director.loadScene("menu");
      },
      onEnterDealState: function onEnterDealState() {
        this.betUI.resetTossedChips();
        this.inGameUI.resetCountdown();
        this.player.renderer.showStakeChips(this.player.stakeNum);
        this.player.addCard(this.decks.draw());
        var holdCard = this.decks.draw();
        this.dealer.addHoleCard(holdCard);
        this.player.addCard(this.decks.draw());
        this.dealer.addCard(this.decks.draw());
        AudioManager.instance.PlaySFX("cardsound");
        this.fsm.onDealed();
      },
      onPlayersTurnState: function onPlayersTurnState(enter) {
        enter && this.inGameUI.showGameState();
      },
      onEnterDealersTurnState: function onEnterDealersTurnState() {
        while (this.dealer.state === ActorPlayingState.Normal) this.dealer.wantHit() ? this.dealer.addCard(this.decks.draw()) : this.dealer.stand();
        this.fsm.onDealerActed();
      },
      onEndState: function onEndState(enter) {
        if (enter) {
          this.dealer.revealHoldCard();
          this.inGameUI.showResultState();
          var outcome = this._getPlayerResult(this.player, this.dealer);
          switch (outcome) {
           case Types.Outcome.Win:
            this.info.string = "You Win";
            this.youwinAnimation.play("youwin");
            AudioManager.instance.PlaySFX("winsound");
            AudioManager.instance.StopMusic("BackgroundMusic");
            this.totalChipsNum += this.player.stakeNum;
            var winChipsNum = this.player.stakeNum;
            !this.player.state === Types.ActorPlayingState.Report && (this.player.hand === Types.Hand.BlackJack ? winChipsNum *= 1.5 : winChipsNum *= 2);
            this.totalChipsNum += winChipsNum;
            this.updateTotalChips();
            break;

           case Types.Outcome.Lose:
            this.info.string = "You Lose";
            this.youwinAnimation.play("youwin");
            AudioManager.instance.PlaySFX("losesound");
            AudioManager.instance.StopMusic("BackgroundMusic");
            break;

           case Types.Outcome.Tie:
            this.info.string = "Draw";
            this.youwinAnimation.play("youwin");
            this.totalChipsNum += this.player.stakeNum;
            this.updateTotalChips();
          }
        }
        this.info.enabled = enter;
      },
      onBetState: function onBetState(enter) {
        if (enter) {
          this.decks.reset();
          this.player.reset();
          this.dealer.reset();
          this.info.string = "Please bet";
          this.inGameUI.showBetState();
          this.inGameUI.startCountdown();
          AudioManager.instance.PlayMusic("BackgroundMusic");
        }
        this.info.enabled = enter;
      },
      _getPlayerResult: function _getPlayerResult(player, dealer) {
        var Outcome = Types.Outcome;
        return player.state === ActorPlayingState.Bust ? Outcome.Lose : dealer.state === ActorPlayingState.Bust ? Outcome.Win : player.state === ActorPlayingState.Report ? Outcome.Win : player.hand > dealer.hand ? Outcome.Win : player.hand < dealer.hand ? Outcome.Lose : player.bestPoint === dealer.bestPoint ? Outcome.Tie : player.bestPoint < dealer.bestPoint ? Outcome.Lose : Outcome.Win;
      },
      droping: function droping() {
        this.d = !this.d;
        if (this.d) {
          AudioManager.instance.PlaySFX("settingsound");
          this.dropAnimation.play("drop");
        } else {
          AudioManager.instance.PlaySFX("settingsound");
          this.dropAnimation.play("dropBack");
        }
      },
      clicksound: function clicksound() {
        AudioManager.instance.PlaySFX("buttonsound");
      }
    });
    cc._RF.pop();
  }, {
    Decks: "Decks",
    PlayerData: "PlayerData",
    Types: "Types",
    audioManager: "audioManager",
    "game-fsm": "game-fsm"
  } ],
  InGameUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f192efroeFEyaxtfh8TVXYz", "InGameUI");
    "use strict";
    var Game = require("Game");
    cc.Class({
      extends: cc.Component,
      properties: {
        betStateUI: cc.Node,
        gameStateUI: cc.Node,
        resultTxt: cc.Label,
        betCounter: cc.ProgressBar,
        btnStart: cc.Node,
        labelTotalChips: cc.Label
      },
      init: function init(betDuration) {
        this.resultTxt.enabled = false;
        this.betStateUI.active = true;
        this.gameStateUI.active = false;
        this.btnStart.active = false;
        this.betDuration = betDuration;
        this.betTimer = 0;
        this.isBetCounting = false;
      },
      startCountdown: function startCountdown() {
        if (this.betCounter) {
          this.betTimer = 0;
          this.isBetCounting = true;
        }
      },
      resetCountdown: function resetCountdown() {
        if (this.betCounter) {
          this.betTimer = 0;
          this.isBetCounting = false;
          this.betCounter.progress = 0;
        }
      },
      showBetState: function showBetState() {
        this.betStateUI.active = true;
        this.gameStateUI.active = false;
        this.btnStart.active = false;
      },
      showGameState: function showGameState() {
        this.betStateUI.active = false;
        this.gameStateUI.active = true;
        this.btnStart.active = false;
      },
      showResultState: function showResultState() {
        this.betStateUI.active = false;
        this.gameStateUI.active = false;
        this.btnStart.active = true;
      },
      update: function update(dt) {
        if (this.isBetCounting) {
          this.betCounter.progress = this.betTimer / this.betDuration;
          this.betTimer += dt;
          if (this.betTimer >= this.betDuration) {
            this.isBetCounting = false;
            this.betCounter.progress = 1;
          }
        }
      }
    });
    cc._RF.pop();
  }, {
    Game: "Game"
  } ],
  Menu: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "20f60m+3RlGO7x2/ARzZ6Qc", "Menu");
    "use strict";
    var AudioManager = require("../scripts/audioManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        audioMng: cc.Node,
        menuMusic: {
          default: null,
          type: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        cc.audioEngine.setLoop(true);
        var audioId = cc.audioEngine.playMusic(this.menuMusic, true);
        cc.director.preloadScene("table", function() {
          cc.log("Next scene preloaded");
        });
      },
      playGame: function playGame() {
        cc.audioEngine.stopAll();
        cc.director.loadScene("table");
      },
      update: function update(dt) {},
      exitGame: function exitGame() {
        cc.game.end();
      }
    });
    cc._RF.pop();
  }, {
    "../scripts/audioManager": "audioManager"
  } ],
  ModalUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "54397cUxehGzqEqpMUGHejs", "ModalUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        mask: cc.Node
      },
      onLoad: function onLoad() {},
      onEnable: function onEnable() {
        this.mask.on("touchstart", function(event) {
          event.stopPropagation();
        });
        this.mask.on("touchend", function(event) {
          event.stopPropagation();
        });
      },
      onDisable: function onDisable() {
        this.mask.off("touchstart", function(event) {
          event.stopPropagation();
        });
        this.mask.off("touchend", function(event) {
          event.stopPropagation();
        });
      }
    });
    cc._RF.pop();
  }, {} ],
  PlayerData: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4f9c5eXxqhHAKLxZeRmgHDB", "PlayerData");
    "use strict";
    var players = [ {
      name: "liza",
      gold: 3e3,
      photoIdx: 0
    }, {
      name: "rose",
      gold: 2e3,
      photoIdx: 1
    }, {
      name: "You",
      gold: 1500,
      photoIdx: 2
    }, {
      name: "jisoo",
      gold: 500,
      photoIdx: 3
    }, {
      name: "selena",
      gold: 9e3,
      photoIdx: 4
    }, {
      name: "ariana",
      gold: 5e3,
      photoIdx: 5
    }, {
      name: "nicky",
      gold: 1e4,
      photoIdx: 6
    } ];
    module.exports = {
      players: players
    };
    cc._RF.pop();
  }, {} ],
  Player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "226a2AvzRpHL7SJGTMy5PDX", "Player");
    "use strict";
    var Actor = require("Actor");
    cc.Class({
      extends: Actor,
      init: function init() {
        this._super();
        this.labelStake = this.renderer.labelStakeOnTable;
        this.stakeNum = 0;
      },
      reset: function reset() {
        this._super();
        this.resetStake();
      },
      addCard: function addCard(card) {
        this._super(card);
      },
      addStake: function addStake(delta) {
        this.stakeNum += delta;
        this.updateStake(this.stakeNum);
      },
      resetStake: function resetStake(delta) {
        this.stakeNum = 0;
        this.updateStake(this.stakeNum);
      },
      updateStake: function updateStake(number) {
        this.labelStake.string = number;
      }
    });
    cc._RF.pop();
  }, {
    Actor: "Actor"
  } ],
  SideSwitcher: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3aae7lZKyhPqqsLD3wMKl6X", "SideSwitcher");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        retainSideNodes: {
          default: [],
          type: cc.Node
        }
      },
      switchSide: function switchSide() {
        this.node.scaleX = -this.node.scaleX;
        for (var i = 0; i < this.retainSideNodes.length; ++i) {
          var curNode = this.retainSideNodes[i];
          curNode.scaleX = -curNode.scaleX;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  TossChip: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b4eb5Lo6U1IZ4eJWuxShCdH", "TossChip");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        anim: cc.Animation
      },
      play: function play() {
        this.anim.play("chip_toss");
      }
    });
    cc._RF.pop();
  }, {} ],
  Types: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5b633QMQxpFmYetofEvK2UD", "Types");
    "use strict";
    var Suit = cc.Enum({
      Spade: 1,
      Heart: 2,
      Club: 3,
      Diamond: 4
    });
    var A2_10JQK = "NAN,A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
    function Card(point, suit) {
      Object.defineProperties(this, {
        point: {
          value: point,
          writable: false
        },
        suit: {
          value: suit,
          writable: false
        },
        id: {
          value: 13 * (suit - 1) + (point - 1),
          writable: false
        },
        pointName: {
          get: function get() {
            return A2_10JQK[this.point];
          }
        },
        suitName: {
          get: function get() {
            return Suit[this.suit];
          }
        },
        isBlackSuit: {
          get: function get() {
            return this.suit === Suit.Spade || this.suit === Suit.Club;
          }
        },
        isRedSuit: {
          get: function get() {
            return this.suit === Suit.Heart || this.suit === Suit.Diamond;
          }
        }
      });
    }
    Card.prototype.toString = function() {
      return this.suitName + " " + this.pointName;
    };
    var cards = new Array(52);
    Card.fromId = function(id) {
      return cards[id];
    };
    (function createCards() {
      for (var s = 1; s <= 4; s++) for (var p = 1; p <= 13; p++) {
        var card = new Card(p, s);
        cards[card.id] = card;
      }
    })();
    var ActorPlayingState = cc.Enum({
      Normal: -1,
      Stand: -1,
      Report: -1,
      Bust: -1
    });
    var Outcome = cc.Enum({
      Win: -1,
      Lose: -1,
      Tie: -1
    });
    var Hand = cc.Enum({
      Normal: -1,
      BlackJack: -1,
      FiveCard: -1
    });
    module.exports = {
      Suit: Suit,
      Card: Card,
      ActorPlayingState: ActorPlayingState,
      Hand: Hand,
      Outcome: Outcome
    };
    cc._RF.pop();
  }, {} ],
  Utils: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "73590esk6xP9ICqhfUZalMg", "Utils");
    "use strict";
    function getMinMaxPoint(cards) {
      var hasAce = false;
      var min = 0;
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        1 === card.point && (hasAce = true);
        min += Math.min(10, card.point);
      }
      var max = min;
      hasAce && min + 10 <= 21 && (max += 10);
      return {
        min: min,
        max: max
      };
    }
    function isBust(cards) {
      var sum = 0;
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        sum += Math.min(10, card.point);
      }
      return sum > 21;
    }
    var isMobile = function isMobile() {
      return cc.sys.isMobile;
    };
    module.exports = {
      isBust: isBust,
      getMinMaxPoint: getMinMaxPoint,
      isMobile: isMobile
    };
    cc._RF.pop();
  }, {} ],
  audioManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0e87ctQfnJLJ45AqoiPnnE0", "audioManager");
    "use strict";
    var Sound = require("sound");
    var AudioManager = cc.Class({
      extends: cc.Component,
      properties: {
        musicSound: [ Sound ],
        sfxSound: [ Sound ],
        musicSource: {
          default: null,
          type: cc.AudioSource
        },
        sfxSource: {
          default: null,
          type: cc.AudioSource
        },
        musicSprite: {
          default: null,
          type: cc.Sprite
        },
        onMusicSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        offMusicSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        sfxSprite: {
          default: null,
          type: cc.Sprite
        },
        onSFXSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        offSFXSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        state1: {
          default: true,
          visible: false
        },
        state2: {
          default: true,
          visible: false
        }
      },
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        AudioManager.instance = this;
      },
      start: function start() {},
      PlayMusic: function PlayMusic(name) {
        var s = this.musicSound.find(function(s) {
          return s.n === name;
        });
        if (null == s) console.log("not found"); else {
          this.musicSource.clip = s.clip;
          this.musicSource.play();
        }
      },
      StopMusic: function StopMusic(name) {
        var s = this.musicSound.find(function(s) {
          return s.n === name;
        });
        if (null == s) console.log("not found"); else {
          this.musicSource.clip = s.clip;
          this.musicSource.stop();
        }
      },
      PlaySFX: function PlaySFX(name) {
        var s = this.sfxSound.find(function(s) {
          return s.n === name;
        });
        if (null == s) console.log("not found"); else {
          this.sfxSource.clip = s.clip;
          this.sfxSource.play();
        }
      },
      MusicButton: function MusicButton() {
        this.PlaySFX("settingsound");
        console.log("ok");
        this.state1 = !this.state1;
        if (this.state1) {
          this.musicSource.volume = 1;
          this.musicSprite.spriteFrame = this.onMusicSpriteFrame;
        } else if (!this.state1 || 0 == this.musicSource.volume) {
          this.musicSource.volume = 0;
          this.musicSprite.spriteFrame = this.offMusicSpriteFrame;
        }
      },
      SFXButton: function SFXButton() {
        this.PlaySFX("settingsound");
        console.log("ko");
        this.state2 = !this.state2;
        if (this.state2) {
          this.sfxSource.volume = 1;
          this.sfxSprite.spriteFrame = this.onSFXSpriteFrame;
        } else {
          this.sfxSource.volume = 0;
          this.sfxSprite.spriteFrame = this.offSFXSpriteFrame;
        }
      }
    });
    cc._RF.pop();
  }, {
    sound: "sound"
  } ],
  "game-fsm": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6510d1SmQRMMYH8FEIA7zXq", "game-fsm");
    "use strict";
    var State = require("state.com");
    var instance;
    var model;
    var playing;
    function on(message) {
      return function(msgToEvaluate) {
        return msgToEvaluate === message;
      };
    }
    var evaluating = false;
    exports = {
      init: function init(target) {
        State.console = console;
        model = new State.StateMachine("root");
        var initial = new State.PseudoState("init-root", model, State.PseudoStateKind.Initial);
        var bet = new State.State("place a bet", model);
        playing = new State.State("Started", model);
        var settled = new State.State("settlement", model);
        initial.to(bet);
        bet.to(playing).when(on("deal"));
        playing.to(settled).when(on("end"));
        settled.to(bet).when(on("bet"));
        bet.entry(function() {
          target.onBetState(true);
        });
        bet.exit(function() {
          target.onBetState(false);
        });
        settled.entry(function() {
          target.onEndState(true);
        });
        settled.exit(function() {
          target.onEndState(false);
        });
        var initialP = new State.PseudoState("init \u5df2\u5f00\u5c40", playing, State.PseudoStateKind.Initial);
        var deal = new State.State("Licensing", playing);
        var playersTurn = new State.State("player decision", playing);
        var dealersTurn = new State.State("dealer decision", playing);
        initialP.to(deal);
        deal.to(playersTurn).when(on("dealed"));
        playersTurn.to(dealersTurn).when(on("player acted"));
        deal.entry(function() {
          target.onEnterDealState();
        });
        playersTurn.entry(function() {
          target.onPlayersTurnState(true);
        });
        playersTurn.exit(function() {
          target.onPlayersTurnState(false);
        });
        dealersTurn.entry(function() {
          target.onEnterDealersTurnState();
        });
        instance = new State.StateMachineInstance("fsm");
        State.initialise(model, instance);
      },
      toDeal: function toDeal() {
        this._evaluate("deal");
      },
      toBet: function toBet() {
        this._evaluate("bet");
      },
      onDealed: function onDealed() {
        this._evaluate("dealed");
      },
      onPlayerActed: function onPlayerActed() {
        this._evaluate("player acted");
      },
      onDealerActed: function onDealerActed() {
        this._evaluate("end");
      },
      _evaluate: function _evaluate(message) {
        if (evaluating) {
          setTimeout(function() {
            State.evaluate(model, instance, message);
          }, 1);
          return;
        }
        evaluating = true;
        State.evaluate(model, instance, message);
        evaluating = false;
      },
      _getInstance: function _getInstance() {
        return instance;
      },
      _getModel: function _getModel() {
        return model;
      }
    };
    module.exports = exports;
    cc._RF.pop();
  }, {
    "state.com": "state.com"
  } ],
  sound: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6481fccwZ9MaqGENVGfH0nJ", "sound");
    "use strict";
    var Sound = cc.Class({
      properties: {
        n: {
          default: "",
          type: cc.String
        },
        clip: {
          default: null,
          type: cc.AudioClip
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  "state.com": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "71d9293mx9CFryhJvRw85ZS", "state.com");
    "use strict";
    var StateJS;
    (function(StateJS) {
      var Behavior = function() {
        function Behavior(behavior) {
          this.actions = [];
          behavior && this.push(behavior);
        }
        Behavior.prototype.push = function(behavior) {
          Array.prototype.push.apply(this.actions, behavior instanceof Behavior ? behavior.actions : arguments);
          return this;
        };
        Behavior.prototype.hasActions = function() {
          return 0 !== this.actions.length;
        };
        Behavior.prototype.invoke = function(message, instance, history) {
          void 0 === history && (history = false);
          this.actions.forEach(function(action) {
            return action(message, instance, history);
          });
        };
        return Behavior;
      }();
      StateJS.Behavior = Behavior;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      (function(PseudoStateKind) {
        PseudoStateKind[PseudoStateKind["Initial"] = 0] = "Initial";
        PseudoStateKind[PseudoStateKind["ShallowHistory"] = 1] = "ShallowHistory";
        PseudoStateKind[PseudoStateKind["DeepHistory"] = 2] = "DeepHistory";
        PseudoStateKind[PseudoStateKind["Choice"] = 3] = "Choice";
        PseudoStateKind[PseudoStateKind["Junction"] = 4] = "Junction";
        PseudoStateKind[PseudoStateKind["Terminate"] = 5] = "Terminate";
      })(StateJS.PseudoStateKind || (StateJS.PseudoStateKind = {}));
      var PseudoStateKind = StateJS.PseudoStateKind;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      (function(TransitionKind) {
        TransitionKind[TransitionKind["Internal"] = 0] = "Internal";
        TransitionKind[TransitionKind["Local"] = 1] = "Local";
        TransitionKind[TransitionKind["External"] = 2] = "External";
      })(StateJS.TransitionKind || (StateJS.TransitionKind = {}));
      var TransitionKind = StateJS.TransitionKind;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var Element = function() {
        function Element(name, parent) {
          this.name = name;
          this.qualifiedName = parent ? parent.qualifiedName + Element.namespaceSeparator + name : name;
        }
        Element.prototype.toString = function() {
          return this.qualifiedName;
        };
        Element.namespaceSeparator = ".";
        return Element;
      }();
      StateJS.Element = Element;
    })(StateJS || (StateJS = {}));
    var __extends = (void 0, function(d, b) {
      for (var p in b) b.hasOwnProperty(p) && (d[p] = b[p]);
      function __() {
        this.constructor = d;
      }
      __.prototype = b.prototype;
      d.prototype = new __();
    });
    var StateJS;
    (function(StateJS) {
      var Region = function(_super) {
        __extends(Region, _super);
        function Region(name, state) {
          _super.call(this, name, state);
          this.vertices = [];
          this.state = state;
          this.state.regions.push(this);
          this.state.getRoot().clean = false;
        }
        Region.prototype.getRoot = function() {
          return this.state.getRoot();
        };
        Region.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitRegion(this, arg1, arg2, arg3);
        };
        Region.defaultName = "default";
        return Region;
      }(StateJS.Element);
      StateJS.Region = Region;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var Vertex = function(_super) {
        __extends(Vertex, _super);
        function Vertex(name, parent) {
          _super.call(this, name, parent = parent instanceof StateJS.State ? parent.defaultRegion() : parent);
          this.outgoing = [];
          this.region = parent;
          if (this.region) {
            this.region.vertices.push(this);
            this.region.getRoot().clean = false;
          }
        }
        Vertex.prototype.getRoot = function() {
          return this.region.getRoot();
        };
        Vertex.prototype.to = function(target, kind) {
          void 0 === kind && (kind = StateJS.TransitionKind.External);
          return new StateJS.Transition(this, target, kind);
        };
        Vertex.prototype.accept = function(visitor, arg1, arg2, arg3) {};
        return Vertex;
      }(StateJS.Element);
      StateJS.Vertex = Vertex;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var PseudoState = function(_super) {
        __extends(PseudoState, _super);
        function PseudoState(name, parent, kind) {
          void 0 === kind && (kind = StateJS.PseudoStateKind.Initial);
          _super.call(this, name, parent);
          this.kind = kind;
        }
        PseudoState.prototype.isHistory = function() {
          return this.kind === StateJS.PseudoStateKind.DeepHistory || this.kind === StateJS.PseudoStateKind.ShallowHistory;
        };
        PseudoState.prototype.isInitial = function() {
          return this.kind === StateJS.PseudoStateKind.Initial || this.isHistory();
        };
        PseudoState.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitPseudoState(this, arg1, arg2, arg3);
        };
        return PseudoState;
      }(StateJS.Vertex);
      StateJS.PseudoState = PseudoState;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var State = function(_super) {
        __extends(State, _super);
        function State(name, parent) {
          _super.call(this, name, parent);
          this.exitBehavior = new StateJS.Behavior();
          this.entryBehavior = new StateJS.Behavior();
          this.regions = [];
        }
        State.prototype.defaultRegion = function() {
          return this.regions.reduce(function(result, region) {
            return region.name === StateJS.Region.defaultName ? region : result;
          }, void 0) || new StateJS.Region(StateJS.Region.defaultName, this);
        };
        State.prototype.isFinal = function() {
          return 0 === this.outgoing.length;
        };
        State.prototype.isSimple = function() {
          return 0 === this.regions.length;
        };
        State.prototype.isComposite = function() {
          return this.regions.length > 0;
        };
        State.prototype.isOrthogonal = function() {
          return this.regions.length > 1;
        };
        State.prototype.exit = function(exitAction) {
          this.exitBehavior.push(exitAction);
          this.getRoot().clean = false;
          return this;
        };
        State.prototype.entry = function(entryAction) {
          this.entryBehavior.push(entryAction);
          this.getRoot().clean = false;
          return this;
        };
        State.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitState(this, arg1, arg2, arg3);
        };
        return State;
      }(StateJS.Vertex);
      StateJS.State = State;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var FinalState = function(_super) {
        __extends(FinalState, _super);
        function FinalState(name, parent) {
          _super.call(this, name, parent);
        }
        FinalState.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitFinalState(this, arg1, arg2, arg3);
        };
        return FinalState;
      }(StateJS.State);
      StateJS.FinalState = FinalState;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var StateMachine = function(_super) {
        __extends(StateMachine, _super);
        function StateMachine(name) {
          _super.call(this, name, void 0);
          this.clean = false;
        }
        StateMachine.prototype.getRoot = function() {
          return this.region ? this.region.getRoot() : this;
        };
        StateMachine.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitStateMachine(this, arg1, arg2, arg3);
        };
        return StateMachine;
      }(StateJS.State);
      StateJS.StateMachine = StateMachine;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var Transition = function() {
        function Transition(source, target, kind) {
          var _this = this;
          void 0 === kind && (kind = StateJS.TransitionKind.External);
          this.transitionBehavior = new StateJS.Behavior();
          this.onTraverse = new StateJS.Behavior();
          this.source = source;
          this.target = target;
          this.kind = target ? kind : StateJS.TransitionKind.Internal;
          this.guard = source instanceof StateJS.PseudoState ? Transition.TrueGuard : function(message) {
            return message === _this.source;
          };
          this.source.outgoing.push(this);
          this.source.getRoot().clean = false;
        }
        Transition.prototype["else"] = function() {
          this.guard = Transition.FalseGuard;
          return this;
        };
        Transition.prototype.when = function(guard) {
          this.guard = guard;
          return this;
        };
        Transition.prototype.effect = function(transitionAction) {
          this.transitionBehavior.push(transitionAction);
          this.source.getRoot().clean = false;
          return this;
        };
        Transition.prototype.accept = function(visitor, arg1, arg2, arg3) {
          return visitor.visitTransition(this, arg1, arg2, arg3);
        };
        Transition.prototype.toString = function() {
          return "[" + (this.target ? this.source + " -> " + this.target : this.source) + "]";
        };
        Transition.TrueGuard = function() {
          return true;
        };
        Transition.FalseGuard = function() {
          return false;
        };
        return Transition;
      }();
      StateJS.Transition = Transition;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var Visitor = function() {
        function Visitor() {}
        Visitor.prototype.visitElement = function(element, arg1, arg2, arg3) {};
        Visitor.prototype.visitRegion = function(region, arg1, arg2, arg3) {
          var _this = this;
          var result = this.visitElement(region, arg1, arg2, arg3);
          region.vertices.forEach(function(vertex) {
            vertex.accept(_this, arg1, arg2, arg3);
          });
          return result;
        };
        Visitor.prototype.visitVertex = function(vertex, arg1, arg2, arg3) {
          var _this = this;
          var result = this.visitElement(vertex, arg1, arg2, arg3);
          vertex.outgoing.forEach(function(transition) {
            transition.accept(_this, arg1, arg2, arg3);
          });
          return result;
        };
        Visitor.prototype.visitPseudoState = function(pseudoState, arg1, arg2, arg3) {
          return this.visitVertex(pseudoState, arg1, arg2, arg3);
        };
        Visitor.prototype.visitState = function(state, arg1, arg2, arg3) {
          var _this = this;
          var result = this.visitVertex(state, arg1, arg2, arg3);
          state.regions.forEach(function(region) {
            region.accept(_this, arg1, arg2, arg3);
          });
          return result;
        };
        Visitor.prototype.visitFinalState = function(finalState, arg1, arg2, arg3) {
          return this.visitState(finalState, arg1, arg2, arg3);
        };
        Visitor.prototype.visitStateMachine = function(stateMachine, arg1, arg2, arg3) {
          return this.visitState(stateMachine, arg1, arg2, arg3);
        };
        Visitor.prototype.visitTransition = function(transition, arg1, arg2, arg3) {};
        return Visitor;
      }();
      StateJS.Visitor = Visitor;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      var StateMachineInstance = function() {
        function StateMachineInstance(name) {
          void 0 === name && (name = "unnamed");
          this.last = {};
          this.isTerminated = false;
          this.name = name;
        }
        StateMachineInstance.prototype.setCurrent = function(region, state) {
          this.last[region.qualifiedName] = state;
        };
        StateMachineInstance.prototype.getCurrent = function(region) {
          return this.last[region.qualifiedName];
        };
        StateMachineInstance.prototype.toString = function() {
          return this.name;
        };
        return StateMachineInstance;
      }();
      StateJS.StateMachineInstance = StateMachineInstance;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      function setRandom(generator) {
        random = generator;
      }
      StateJS.setRandom = setRandom;
      function getRandom() {
        return random;
      }
      StateJS.getRandom = getRandom;
      var random = function random(max) {
        return Math.floor(Math.random() * max);
      };
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      function isActive(element, stateMachineInstance) {
        if (element instanceof StateJS.Region) return isActive(element.state, stateMachineInstance);
        if (element instanceof StateJS.State) return !element.region || isActive(element.region, stateMachineInstance) && stateMachineInstance.getCurrent(element.region) === element;
      }
      StateJS.isActive = isActive;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      function isComplete(element, instance) {
        if (element instanceof StateJS.Region) return instance.getCurrent(element).isFinal();
        if (element instanceof StateJS.State) return element.regions.every(function(region) {
          return isComplete(region, instance);
        });
        return true;
      }
      StateJS.isComplete = isComplete;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      function initialise(stateMachineModel, stateMachineInstance, autoInitialiseModel) {
        void 0 === autoInitialiseModel && (autoInitialiseModel = true);
        if (stateMachineInstance) {
          autoInitialiseModel && false === stateMachineModel.clean && initialise(stateMachineModel);
          StateJS.console.log("initialise " + stateMachineInstance);
          stateMachineModel.onInitialise.invoke(void 0, stateMachineInstance);
        } else {
          StateJS.console.log("initialise " + stateMachineModel.name);
          stateMachineModel.accept(new InitialiseElements(), false);
          stateMachineModel.clean = true;
        }
      }
      StateJS.initialise = initialise;
      function evaluate(stateMachineModel, stateMachineInstance, message, autoInitialiseModel) {
        void 0 === autoInitialiseModel && (autoInitialiseModel = true);
        StateJS.console.log(stateMachineInstance + " evaluate " + message);
        autoInitialiseModel && false === stateMachineModel.clean && initialise(stateMachineModel);
        if (stateMachineInstance.isTerminated) return false;
        return evaluateState(stateMachineModel, stateMachineInstance, message);
      }
      StateJS.evaluate = evaluate;
      function evaluateState(state, stateMachineInstance, message) {
        var result = false;
        state.regions.every(function(region) {
          if (evaluateState(stateMachineInstance.getCurrent(region), stateMachineInstance, message)) {
            result = true;
            return StateJS.isActive(state, stateMachineInstance);
          }
          return true;
        });
        if (result) message !== state && StateJS.isComplete(state, stateMachineInstance) && evaluateState(state, stateMachineInstance, state); else {
          var transitions = state.outgoing.filter(function(transition) {
            return transition.guard(message, stateMachineInstance);
          });
          1 === transitions.length ? result = traverse(transitions[0], stateMachineInstance, message) : transitions.length > 1 && StateJS.console.error(state + ": multiple outbound transitions evaluated true for message " + message);
        }
        return result;
      }
      function traverse(transition, instance, message) {
        var onTraverse = new StateJS.Behavior(transition.onTraverse), target = transition.target;
        while (target && target instanceof StateJS.PseudoState && target.kind === StateJS.PseudoStateKind.Junction) {
          target = (transition = selectTransition(target, instance, message)).target;
          onTraverse.push(transition.onTraverse);
        }
        onTraverse.invoke(message, instance);
        target && target instanceof StateJS.PseudoState && target.kind === StateJS.PseudoStateKind.Choice ? traverse(selectTransition(target, instance, message), instance, message) : target && target instanceof StateJS.State && StateJS.isComplete(target, instance) && evaluateState(target, instance, target);
        return true;
      }
      function selectTransition(pseudoState, stateMachineInstance, message) {
        var results = pseudoState.outgoing.filter(function(transition) {
          return transition.guard(message, stateMachineInstance);
        });
        if (pseudoState.kind === StateJS.PseudoStateKind.Choice) return 0 !== results.length ? results[StateJS.getRandom()(results.length)] : findElse(pseudoState);
        if (!(results.length > 1)) return results[0] || findElse(pseudoState);
        StateJS.console.error("Multiple outbound transition guards returned true at " + this + " for " + message);
      }
      function findElse(pseudoState) {
        return pseudoState.outgoing.filter(function(transition) {
          return transition.guard === StateJS.Transition.FalseGuard;
        })[0];
      }
      function leave(elementBehavior) {
        return elementBehavior[0] || (elementBehavior[0] = new StateJS.Behavior());
      }
      function beginEnter(elementBehavior) {
        return elementBehavior[1] || (elementBehavior[1] = new StateJS.Behavior());
      }
      function endEnter(elementBehavior) {
        return elementBehavior[2] || (elementBehavior[2] = new StateJS.Behavior());
      }
      function enter(elementBehavior) {
        return new StateJS.Behavior(beginEnter(elementBehavior)).push(endEnter(elementBehavior));
      }
      function ancestors(vertex) {
        return (vertex.region ? ancestors(vertex.region.state) : []).concat(vertex);
      }
      var InitialiseTransitions = function(_super) {
        __extends(InitialiseTransitions, _super);
        function InitialiseTransitions() {
          _super.apply(this, arguments);
        }
        InitialiseTransitions.prototype.visitTransition = function(transition, behaviour) {
          transition.kind === StateJS.TransitionKind.Internal ? transition.onTraverse.push(transition.transitionBehavior) : transition.kind === StateJS.TransitionKind.Local ? this.visitLocalTransition(transition, behaviour) : this.visitExternalTransition(transition, behaviour);
        };
        InitialiseTransitions.prototype.visitLocalTransition = function(transition, behaviour) {
          var _this = this;
          transition.onTraverse.push(function(message, instance) {
            var targetAncestors = ancestors(transition.target), i = 0;
            while (StateJS.isActive(targetAncestors[i], instance)) ++i;
            leave(behaviour(instance.getCurrent(targetAncestors[i].region))).invoke(message, instance);
            transition.transitionBehavior.invoke(message, instance);
            while (i < targetAncestors.length) _this.cascadeElementEntry(transition, behaviour, targetAncestors[i++], targetAncestors[i], function(behavior) {
              behavior.invoke(message, instance);
            });
            endEnter(behaviour(transition.target)).invoke(message, instance);
          });
        };
        InitialiseTransitions.prototype.visitExternalTransition = function(transition, behaviour) {
          var sourceAncestors = ancestors(transition.source), targetAncestors = ancestors(transition.target), i = Math.min(sourceAncestors.length, targetAncestors.length) - 1;
          while (sourceAncestors[i - 1] !== targetAncestors[i - 1]) --i;
          transition.onTraverse.push(leave(behaviour(sourceAncestors[i])));
          transition.onTraverse.push(transition.transitionBehavior);
          while (i < targetAncestors.length) this.cascadeElementEntry(transition, behaviour, targetAncestors[i++], targetAncestors[i], function(behavior) {
            return transition.onTraverse.push(behavior);
          });
          transition.onTraverse.push(endEnter(behaviour(transition.target)));
        };
        InitialiseTransitions.prototype.cascadeElementEntry = function(transition, behaviour, element, next, task) {
          task(beginEnter(behaviour(element)));
          next && element instanceof StateJS.State && element.regions.forEach(function(region) {
            task(beginEnter(behaviour(region)));
            region !== next.region && task(endEnter(behaviour(region)));
          });
        };
        return InitialiseTransitions;
      }(StateJS.Visitor);
      var InitialiseElements = function(_super) {
        __extends(InitialiseElements, _super);
        function InitialiseElements() {
          _super.apply(this, arguments);
          this.behaviours = {};
        }
        InitialiseElements.prototype.behaviour = function(element) {
          return this.behaviours[element.qualifiedName] || (this.behaviours[element.qualifiedName] = []);
        };
        InitialiseElements.prototype.visitElement = function(element, deepHistoryAbove) {
          if (StateJS.console !== defaultConsole) {
            leave(this.behaviour(element)).push(function(message, instance) {
              return StateJS.console.log(instance + " leave " + element);
            });
            beginEnter(this.behaviour(element)).push(function(message, instance) {
              return StateJS.console.log(instance + " enter " + element);
            });
          }
        };
        InitialiseElements.prototype.visitRegion = function(region, deepHistoryAbove) {
          var _this = this;
          var regionInitial = region.vertices.reduce(function(result, vertex) {
            return vertex instanceof StateJS.PseudoState && vertex.isInitial() ? vertex : result;
          }, void 0);
          region.vertices.forEach(function(vertex) {
            vertex.accept(_this, deepHistoryAbove || regionInitial && regionInitial.kind === StateJS.PseudoStateKind.DeepHistory);
          });
          leave(this.behaviour(region)).push(function(message, stateMachineInstance) {
            return leave(_this.behaviour(stateMachineInstance.getCurrent(region))).invoke(message, stateMachineInstance);
          });
          deepHistoryAbove || !regionInitial || regionInitial.isHistory() ? endEnter(this.behaviour(region)).push(function(message, stateMachineInstance, history) {
            enter(_this.behaviour((history || regionInitial.isHistory()) && stateMachineInstance.getCurrent(region) || regionInitial)).invoke(message, stateMachineInstance, history || regionInitial.kind === StateJS.PseudoStateKind.DeepHistory);
          }) : endEnter(this.behaviour(region)).push(enter(this.behaviour(regionInitial)));
          this.visitElement(region, deepHistoryAbove);
        };
        InitialiseElements.prototype.visitPseudoState = function(pseudoState, deepHistoryAbove) {
          _super.prototype.visitPseudoState.call(this, pseudoState, deepHistoryAbove);
          pseudoState.isInitial() ? endEnter(this.behaviour(pseudoState)).push(function(message, stateMachineInstance) {
            return traverse(pseudoState.outgoing[0], stateMachineInstance);
          }) : pseudoState.kind === StateJS.PseudoStateKind.Terminate && beginEnter(this.behaviour(pseudoState)).push(function(message, stateMachineInstance) {
            return stateMachineInstance.isTerminated = true;
          });
        };
        InitialiseElements.prototype.visitState = function(state, deepHistoryAbove) {
          var _this = this;
          state.regions.forEach(function(region) {
            region.accept(_this, deepHistoryAbove);
            leave(_this.behaviour(state)).push(leave(_this.behaviour(region)));
            endEnter(_this.behaviour(state)).push(enter(_this.behaviour(region)));
          });
          this.visitVertex(state, deepHistoryAbove);
          leave(this.behaviour(state)).push(state.exitBehavior);
          beginEnter(this.behaviour(state)).push(state.entryBehavior);
          beginEnter(this.behaviour(state)).push(function(message, stateMachineInstance) {
            state.region && stateMachineInstance.setCurrent(state.region, state);
          });
        };
        InitialiseElements.prototype.visitStateMachine = function(stateMachine, deepHistoryAbove) {
          var _this = this;
          _super.prototype.visitStateMachine.call(this, stateMachine, deepHistoryAbove);
          stateMachine.accept(new InitialiseTransitions(), function(element) {
            return _this.behaviour(element);
          });
          stateMachine.onInitialise = enter(this.behaviour(stateMachine));
        };
        return InitialiseElements;
      }(StateJS.Visitor);
      var defaultConsole = {
        log: function log(message) {
          var optionalParams = [];
          for (var _i = 1; _i < arguments.length; _i++) optionalParams[_i - 1] = arguments[_i];
        },
        warn: function warn(message) {
          var optionalParams = [];
          for (var _i = 1; _i < arguments.length; _i++) optionalParams[_i - 1] = arguments[_i];
        },
        error: function error(message) {
          var optionalParams = [];
          for (var _i = 1; _i < arguments.length; _i++) optionalParams[_i - 1] = arguments[_i];
          throw message;
        }
      };
      StateJS.console = defaultConsole;
    })(StateJS || (StateJS = {}));
    var StateJS;
    (function(StateJS) {
      function validate(stateMachineModel) {
        stateMachineModel.accept(new Validator());
      }
      StateJS.validate = validate;
      function ancestors(vertex) {
        return (vertex.region ? ancestors(vertex.region.state) : []).concat(vertex);
      }
      var Validator = function(_super) {
        __extends(Validator, _super);
        function Validator() {
          _super.apply(this, arguments);
        }
        Validator.prototype.visitPseudoState = function(pseudoState) {
          _super.prototype.visitPseudoState.call(this, pseudoState);
          if (pseudoState.kind === StateJS.PseudoStateKind.Choice || pseudoState.kind === StateJS.PseudoStateKind.Junction) {
            0 === pseudoState.outgoing.length && StateJS.console.error(pseudoState + ": " + pseudoState.kind + " pseudo states must have at least one outgoing transition.");
            pseudoState.outgoing.filter(function(transition) {
              return transition.guard === StateJS.Transition.FalseGuard;
            }).length > 1 && StateJS.console.error(pseudoState + ": " + pseudoState.kind + " pseudo states cannot have more than one Else transitions.");
          } else {
            0 !== pseudoState.outgoing.filter(function(transition) {
              return transition.guard === StateJS.Transition.FalseGuard;
            }).length && StateJS.console.error(pseudoState + ": " + pseudoState.kind + " pseudo states cannot have Else transitions.");
            pseudoState.isInitial() && (1 !== pseudoState.outgoing.length ? StateJS.console.error(pseudoState + ": initial pseudo states must have one outgoing transition.") : pseudoState.outgoing[0].guard !== StateJS.Transition.TrueGuard && StateJS.console.error(pseudoState + ": initial pseudo states cannot have a guard condition."));
          }
        };
        Validator.prototype.visitRegion = function(region) {
          _super.prototype.visitRegion.call(this, region);
          var initial;
          region.vertices.forEach(function(vertex) {
            if (vertex instanceof StateJS.PseudoState && vertex.isInitial()) {
              initial && StateJS.console.error(region + ": regions may have at most one initial pseudo state.");
              initial = vertex;
            }
          });
        };
        Validator.prototype.visitState = function(state) {
          _super.prototype.visitState.call(this, state);
          state.regions.filter(function(state) {
            return state.name === StateJS.Region.defaultName;
          }).length > 1 && StateJS.console.error(state + ": a state cannot have more than one region named " + StateJS.Region.defaultName);
        };
        Validator.prototype.visitFinalState = function(finalState) {
          _super.prototype.visitFinalState.call(this, finalState);
          0 !== finalState.outgoing.length && StateJS.console.error(finalState + ": final states must not have outgoing transitions.");
          0 !== finalState.regions.length && StateJS.console.error(finalState + ": final states must not have child regions.");
          finalState.entryBehavior.hasActions() && StateJS.console.warn(finalState + ": final states may not have entry behavior.");
          finalState.exitBehavior.hasActions() && StateJS.console.warn(finalState + ": final states may not have exit behavior.");
        };
        Validator.prototype.visitTransition = function(transition) {
          _super.prototype.visitTransition.call(this, transition);
          transition.kind === StateJS.TransitionKind.Local && -1 === ancestors(transition.target).indexOf(transition.source) && StateJS.console.error(transition + ": local transition target vertices must be a child of the source composite sate.");
        };
        return Validator;
      }(StateJS.Visitor);
    })(StateJS || (StateJS = {}));
    module.exports = StateJS;
    cc._RF.pop();
  }, {} ],
  "use_v2.1-2.2.1_cc.Toggle_event": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3961a1JY8tI05jzC0KjDR3d", "use_v2.1-2.2.1_cc.Toggle_event");
    "use strict";
    cc.Toggle && (cc.Toggle._triggerEventInScript_isChecked = true);
    cc._RF.pop();
  }, {} ]
}, {}, [ "use_v2.1-2.2.1_cc.Toggle_event", "Actor", "ActorRenderer", "AssetMng", "AudioMng", "Bet", "Card", "Dealer", "FXPlayer", "Game", "Menu", "Player", "SideSwitcher", "TossChip", "ButtonScaler", "InGameUI", "ModalUI", "audioManager", "state.com", "Decks", "PlayerData", "Types", "Utils", "game-fsm", "sound" ]);
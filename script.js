// Bisswiz Card Game

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const IS_RED = { '♥': true, '♦': true, '♠': false, '♣': false };

// Points per card rank (Ace=11, 10=10, K=4, Q=3, J=2, others=0)
const CARD_POINTS = { A: 11, 10: 10, K: 4, Q: 3, J: 2 };

// Numeric rank order for comparisons
const RANK_ORDER = { 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, J:11, Q:12, K:13, A:14 };

const TARGET_SCORE = 500;

// ── Phutimizer 81 ─────────────────────────────────────────────────────────────
// Converts a 1-81 slider level into gameplay modifiers.
// level=1  → easy (CPU plays weakly, delays are slow)
// level=41 → standard
// level=81 → maximum (CPU plays optimally, quicker pace)
function phutConfig(level) {
    const t = (level - 1) / 80; // 0..1
    return {
        cpuDelay:   Math.round(1400 - t * 1000),  // 1400ms → 400ms
        resolveDelay: Math.round(1600 - t * 1000),// 1600ms → 600ms
        trickDelay: Math.round(1400 - t * 1000),
        cpuSmartness: t,                           // 0=random, 1=optimal
    };
}

// ── Phu Si – in-game advisor tips ────────────────────────────────────────────
const PHUSI_TIPS = [
    { trigger: 'general', text: 'Lead with your highest card when you want to win the trick outright.' },
    { trigger: 'general', text: 'In Bisswiz, saving a high card (Ace or 10) until late in the round can be decisive.' },
    { trigger: 'general', text: 'Watch the pot size — only bet what you can afford to lose each round.' },
    { trigger: 'general', text: 'If you have no cards of the led suit, any card can be played. Use it to discard low-value cards.' },
    { trigger: 'general', text: 'Teams of two (4-player mode) benefit from coordination — your partner wins tricks for both of you!' },
    { trigger: 'general', text: 'The Phutimizer 81 slider sets CPU difficulty. Crank it to 81 for the hardest challenge.' },
    { trigger: 'winning', text: 'You\'re in the lead! Keep pressure on opponents by winning high-point tricks.' },
    { trigger: 'losing',  text: 'You\'re behind — try to win tricks with point cards (A, 10, K) to close the gap.' },
    { trigger: 'lowbet',  text: 'Small bets are safe, but big bets mean big rewards when you win the round!' },
];

function phusiHint(context) {
    const pool = PHUSI_TIPS.filter(t => t.trigger === 'general' || t.trigger === context);
    return pool[Math.floor(Math.random() * pool.length)].text;
}

class BisswizGame {
    constructor() {
        this.players = [];
        this.teams = [];          // array of arrays of player indices
        this.teamScores = [];     // cumulative game scores per team
        this.roundNumber = 0;
        this.currentTrick = [];   // [{playerIndex, card}]
        this.currentPlayer = 0;
        this.trickLeader = 0;
        this.bets = [];           // bet amount per player for current round
        this.betIndex = 0;
        this.bettingPhase = false;
        this.playingPhase = false;
        this.phutLevel = 41;      // Phutimizer 81 level (1-81)

        this.setupEventListeners();
        this.updatePlayerSetup(2);
        this.syncPhutimizer();
    }

    // ── Setup ────────────────────────────────────────────────────────────────

    setupEventListeners() {
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updatePlayerSetup(parseInt(e.target.dataset.count));
            });
        });

        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('placeBetBtn').addEventListener('click', () => this.placeBet());
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            document.getElementById('winScreen').classList.add('hidden');
            document.getElementById('setupScreen').classList.remove('hidden');
        });

        // Phutimizer 81 – setup screen slider
        const setupSlider = document.getElementById('phutLevel');
        setupSlider.addEventListener('input', () => {
            this.phutLevel = parseInt(setupSlider.value);
            document.getElementById('phutLevelLabel').textContent = this.phutLevel;
            this.syncPhutimizer();
        });

        // Phutimizer 81 – in-game slider
        const gameSlider = document.getElementById('phutLevelInGame');
        gameSlider.addEventListener('input', () => {
            this.phutLevel = parseInt(gameSlider.value);
            document.getElementById('phutLevelGame').textContent = this.phutLevel;
            this.syncPhutimizer();
        });

        // Phu Si button
        document.getElementById('phusiBtn').addEventListener('click', () => this.showPhusiPanel());
        document.getElementById('phusiClose').addEventListener('click', () => {
            document.getElementById('phusiPanel').classList.add('hidden');
        });

        // Social sharing
        document.getElementById('shareTwitter').addEventListener('click',  () => this.shareGame('twitter'));
        document.getElementById('shareFacebook').addEventListener('click', () => this.shareGame('facebook'));
        document.getElementById('shareWhatsapp').addEventListener('click', () => this.shareGame('whatsapp'));
        document.getElementById('shareCopy').addEventListener('click',     () => this.shareGame('copy'));
    }

    syncPhutimizer() {
        const level = this.phutLevel;
        // Keep both sliders in sync
        const setupSlider = document.getElementById('phutLevel');
        const gameSlider  = document.getElementById('phutLevelInGame');
        if (setupSlider) setupSlider.value = level;
        if (gameSlider)  gameSlider.value  = level;
        const labelSetup = document.getElementById('phutLevelLabel');
        const labelGame  = document.getElementById('phutLevelGame');
        if (labelSetup) labelSetup.textContent = level;
        if (labelGame)  labelGame.textContent  = level;
        const bar = document.getElementById('phutBar');
        if (bar) bar.style.width = `${Math.round(((level - 1) / 80) * 100)}%`;
    }

    updatePlayerSetup(count) {
        const container = document.getElementById('playerSetup');
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const isHuman = i === 0;
            const div = document.createElement('div');
            div.className = 'player-input-row';
            div.innerHTML = `
                <label>Player ${i + 1}${isHuman ? ' (You)' : ' (CPU)'}:</label>
                <input type="text" id="pName${i}" value="${isHuman ? 'Player 1' : 'CPU ' + i}" class="name-input">
            `;
            container.appendChild(div);
        }
    }

    startGame() {
        const playerCount = parseInt(document.querySelector('.count-btn.active').dataset.count);
        const startCredits = Math.max(100, parseInt(document.getElementById('startingCredits').value) || 500);

        this.players = Array.from({ length: playerCount }, (_, i) => ({
            name: document.getElementById(`pName${i}`).value.trim() || `Player ${i + 1}`,
            isHuman: i === 0,
            hand: [],
            credits: startCredits,
            pointsWon: 0,
            tricksWon: 0,
        }));

        // Team assignment
        if (playerCount === 4) {
            this.teams = [[0, 2], [1, 3]];
        } else {
            // 2 or 3 players: each is their own team
            this.teams = this.players.map((_, i) => [i]);
        }

        this.teamScores = this.teams.map(() => 0);
        this.roundNumber = 0;

        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        this.syncPhutimizer();

        this.startRound();
    }

    // ── Deck ─────────────────────────────────────────────────────────────────

    createShuffledDeck() {
        const deck = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({ suit, rank, points: CARD_POINTS[rank] || 0 });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCards() {
        const deck = this.createShuffledDeck();
        const n = this.players.length;
        const perPlayer = Math.floor(52 / n);
        this.players.forEach((player, i) => {
            player.hand = deck.slice(i * perPlayer, (i + 1) * perPlayer);
            // Sort by suit then rank
            player.hand.sort((a, b) =>
                SUITS.indexOf(a.suit) !== SUITS.indexOf(b.suit)
                    ? SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)
                    : RANK_ORDER[a.rank] - RANK_ORDER[b.rank]
            );
            player.pointsWon = 0;
            player.tricksWon = 0;
        });
    }

    // ── Round lifecycle ───────────────────────────────────────────────────────

    startRound() {
        this.roundNumber++;
        document.getElementById('roundBadge').textContent = this.roundNumber;
        this.currentTrick = [];
        this.bets = new Array(this.players.length).fill(0);

        this.dealCards();
        this.updateScoreboard();

        // Betting phase
        this.bettingPhase = true;
        this.playingPhase = false;
        this.betIndex = 0;
        this.processBetting();
    }

    processBetting() {
        const cfg = phutConfig(this.phutLevel);
        if (this.betIndex >= this.players.length) {
            // All bets placed — start play
            this.bettingPhase = false;
            this.playingPhase = true;
            this.currentTrick = [];
            this.currentPlayer = this.trickLeader;
            this.renderGame();
            this.showMessage(`Round ${this.roundNumber} starts! ${this.players[this.currentPlayer].name} leads.`);
            if (!this.players[this.currentPlayer].isHuman) {
                setTimeout(() => this.cpuPlayCard(), cfg.cpuDelay);
            }
            return;
        }

        const player = this.players[this.betIndex];
        if (player.isHuman) {
            const panel = document.getElementById('bettingPanel');
            const input = document.getElementById('betAmount');
            document.getElementById('betRoundLabel').textContent = `Bet for Round ${this.roundNumber} (you have ${player.credits} credits):`;
            input.max = Math.max(0, player.credits);
            input.value = Math.min(10, player.credits);
            panel.classList.remove('hidden');
            this.showMessage(`💰 ${player.name}, place your bet!`);
        } else {
            // CPU bets: smartness scales bet aggressiveness with Phutimizer level
            const smartness = phutConfig(this.phutLevel).cpuSmartness;
            const maxFrac = 0.05 + smartness * 0.25; // 5%–30% of credits
            const maxBet = Math.floor(player.credits * maxFrac);
            const bet = player.credits > 0 ? Math.floor(Math.random() * maxBet) + 1 : 0;
            this.bets[this.betIndex] = Math.min(bet, player.credits);
            this.betIndex++;
            this.processBetting();
        }
    }

    placeBet() {
        const player = this.players[this.betIndex];
        let bet = parseInt(document.getElementById('betAmount').value) || 0;
        bet = Math.max(0, Math.min(bet, player.credits));
        this.bets[this.betIndex] = bet;
        document.getElementById('bettingPanel').classList.add('hidden');
        this.betIndex++;
        this.processBetting();
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    renderGame() {
        this.renderPlayerHand();
        this.renderOpponents();
        this.renderTrickArea();
        this.updateScoreboard();
        this.updatePlayerInfo();
    }

    renderPlayerHand() {
        const hand = document.getElementById('playerHand');
        hand.innerHTML = '';
        const player = this.players[0];
        player.hand.forEach((card, index) => {
            const el = this.makeCardElement(card);
            const playable = this.playingPhase &&
                             this.currentPlayer === 0 &&
                             this.isCardPlayable(card, player.hand);
            if (playable) {
                el.classList.add('playable');
                el.addEventListener('click', () => this.humanPlayCard(index));
            }
            hand.appendChild(el);
        });
    }

    renderOpponents() {
        const area = document.getElementById('opponentsArea');
        area.innerHTML = '';
        for (let i = 1; i < this.players.length; i++) {
            const player = this.players[i];
            const isCurrent = this.playingPhase && this.currentPlayer === i;
            const div = document.createElement('div');
            div.className = 'opponent-area';
            div.innerHTML = `
                <div class="opponent-name${isCurrent ? ' active' : ''}">
                    ${player.name}${isCurrent ? ' ▶' : ''}
                </div>
                <div class="opponent-hand">
                    ${player.hand.map(() => '<div class="card card-back">🃏</div>').join('')}
                </div>
                <div class="opponent-stats">
                    💰 ${player.credits} credits &nbsp;|&nbsp; 🃏 ${player.hand.length} cards
                </div>
            `;
            area.appendChild(div);
        }
    }

    renderTrickArea() {
        const area = document.getElementById('trickArea');
        area.innerHTML = '';
        this.currentTrick.forEach(({ playerIndex, card }) => {
            const el = this.makeCardElement(card);
            el.classList.add('played');
            const label = document.createElement('span');
            label.className = 'player-label';
            label.textContent = this.players[playerIndex].name;
            el.appendChild(label);
            area.appendChild(el);
        });

        const pot = this.bets.reduce((a, b) => a + b, 0);
        document.getElementById('roundInfo').innerHTML = `
            <div>Round ${this.roundNumber} &nbsp;|&nbsp; 💰 Pot: ${pot} credits</div>
            <div>${this.players.map(p => `${p.name}: ${p.tricksWon} tricks`).join(' &nbsp;|&nbsp; ')}</div>
        `;
    }

    makeCardElement(card) {
        const el = document.createElement('div');
        el.className = `card ${IS_RED[card.suit] ? 'red' : 'black'}`;
        el.innerHTML = `<span class="c-rank">${card.rank}</span><span class="c-suit">${card.suit}</span>`;
        return el;
    }

    updateScoreboard() {
        const display = document.getElementById('scoreDisplay');
        display.innerHTML = '';
        this.teams.forEach((team, i) => {
            const score = this.teamScores[i];
            const progress = Math.min(100, (score / TARGET_SCORE) * 100);
            const div = document.createElement('div');
            div.className = 'score-row';
            div.innerHTML = `
                <div class="team-name">${this.teamName(i)}</div>
                <div class="score-bar-container"><div class="score-bar" style="width:${progress}%"></div></div>
                <div class="score-value">${score} / 500</div>
            `;
            display.appendChild(div);
        });
    }

    updatePlayerInfo() {
        const p = this.players[0];
        document.getElementById('playerNameDisplay').textContent = p.name;
        document.getElementById('playerCreditsDisplay').textContent = `💰 ${p.credits} credits`;
    }

    // ── Game logic ────────────────────────────────────────────────────────────

    isCardPlayable(card, hand) {
        if (this.currentTrick.length === 0) return true;
        const ledSuit = this.currentTrick[0].card.suit;
        const hasSuit = hand.some(c => c.suit === ledSuit);
        return hasSuit ? card.suit === ledSuit : true;
    }

    humanPlayCard(cardIndex) {
        if (!this.playingPhase || this.currentPlayer !== 0) return;
        const player = this.players[0];
        if (!this.isCardPlayable(player.hand[cardIndex], player.hand)) return;
        this.playCard(0, cardIndex);
    }

    cpuPlayCard() {
        if (!this.playingPhase) return;
        const cfg = phutConfig(this.phutLevel);
        const idx = this.currentPlayer;
        const player = this.players[idx];
        const playable = player.hand
            .map((card, i) => ({ card, i }))
            .filter(({ card }) => this.isCardPlayable(card, player.hand));

        let chosenIndex;
        if (cfg.cpuSmartness < 0.33) {
            // Low level: random card selection
            chosenIndex = playable[Math.floor(Math.random() * playable.length)].i;
        } else if (cfg.cpuSmartness < 0.66) {
            // Mid level: prefer highest card
            playable.sort((a, b) => RANK_ORDER[b.card.rank] - RANK_ORDER[a.card.rank]);
            chosenIndex = playable[0].i;
        } else {
            // High level (Phutimizer 81 max): strategic – lead high-point cards, otherwise highest
            const ledSuit = this.currentTrick.length > 0 ? this.currentTrick[0].card.suit : null;
            const onSuit = ledSuit ? playable.filter(p => p.card.suit === ledSuit) : playable;
            const pool = onSuit.length > 0 ? onSuit : playable;
            // Prefer cards with the most points, then highest rank
            pool.sort((a, b) => {
                const pDiff = (CARD_POINTS[b.card.rank] || 0) - (CARD_POINTS[a.card.rank] || 0);
                return pDiff !== 0 ? pDiff : RANK_ORDER[b.card.rank] - RANK_ORDER[a.card.rank];
            });
            chosenIndex = pool[0].i;
        }
        this.playCard(idx, chosenIndex);
    }

    playCard(playerIndex, cardIndex) {
        const cfg = phutConfig(this.phutLevel);
        const player = this.players[playerIndex];
        const card = player.hand.splice(cardIndex, 1)[0];
        this.currentTrick.push({ playerIndex, card });
        this.renderGame();

        if (this.currentTrick.length === this.players.length) {
            setTimeout(() => this.resolveTrick(), cfg.resolveDelay);
        } else {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            this.renderGame();
            if (!this.players[this.currentPlayer].isHuman) {
                setTimeout(() => this.cpuPlayCard(), cfg.cpuDelay);
            }
        }
    }

    resolveTrick() {
        const cfg = phutConfig(this.phutLevel);
        const ledSuit = this.currentTrick[0].card.suit;
        let winnerSlot = 0;
        let highest = RANK_ORDER[this.currentTrick[0].card.rank];
        for (let i = 1; i < this.currentTrick.length; i++) {
            const { card } = this.currentTrick[i];
            if (card.suit === ledSuit && RANK_ORDER[card.rank] > highest) {
                highest = RANK_ORDER[card.rank];
                winnerSlot = i;
            }
        }

        const winnerPlayerIndex = this.currentTrick[winnerSlot].playerIndex;
        const trickPts = this.currentTrick.reduce((s, { card }) => s + (CARD_POINTS[card.rank] || 0), 0);

        this.players[winnerPlayerIndex].tricksWon++;
        this.players[winnerPlayerIndex].pointsWon += trickPts;

        this.showMessage(`${this.players[winnerPlayerIndex].name} wins the trick! +${trickPts} pts`);

        this.trickLeader = winnerPlayerIndex;
        this.currentPlayer = winnerPlayerIndex;
        this.currentTrick = [];

        if (this.players[0].hand.length === 0) {
            setTimeout(() => this.endRound(), cfg.trickDelay);
        } else {
            setTimeout(() => {
                this.renderGame();
                if (!this.players[this.currentPlayer].isHuman) {
                    setTimeout(() => this.cpuPlayCard(), cfg.cpuDelay);
                }
            }, cfg.trickDelay);
        }
    }

    endRound() {
        // Add round points to team scores
        this.teams.forEach((team, i) => {
            const pts = team.reduce((s, pi) => s + this.players[pi].pointsWon, 0);
            this.teamScores[i] += pts;
        });

        // Determine which team won this round (most points)
        let roundWinner = 0;
        let maxPts = -1;
        this.teams.forEach((team, i) => {
            const pts = team.reduce((s, pi) => s + this.players[pi].pointsWon, 0);
            if (pts > maxPts) { maxPts = pts; roundWinner = i; }
        });

        // Credits transfer: winning team collects all bets (remainder goes to first winner)
        const pot = this.bets.reduce((a, b) => a + b, 0);
        this.players.forEach((p, i) => { p.credits -= this.bets[i]; });
        const winTeam = this.teams[roundWinner];
        const baseShare = Math.floor(pot / winTeam.length);
        const remainder = pot - baseShare * winTeam.length;
        winTeam.forEach((pi, j) => { this.players[pi].credits += baseShare + (j === 0 ? remainder : 0); });

        this.updateScoreboard();

        const summary = this.teams
            .map((team, i) => {
                const pts = team.reduce((s, pi) => s + this.players[pi].pointsWon, 0);
                return `${this.teamName(i)}: ${pts} pts`;
            })
            .join(' | ');
        this.showMessage(`Round ${this.roundNumber} over! ${summary}`);

        // Check win condition
        const winner = this.teamScores.findIndex(s => s >= TARGET_SCORE);
        if (winner !== -1) {
            setTimeout(() => this.endGame(winner), 1500);
        } else {
            setTimeout(() => this.startRound(), 2500);
        }
    }

    endGame(winnerTeamIdx) {
        document.getElementById('gameScreen').classList.add('hidden');
        const winScreen = document.getElementById('winScreen');

        this._lastWinnerTeam = winnerTeamIdx;

        document.getElementById('winMessage').innerHTML = `
            <h1>🎉 Game Over!</h1>
            <h2>${this.teamName(winnerTeamIdx)} Wins!</h2>
            <p>Reached ${this.teamScores[winnerTeamIdx]} points — first to ${TARGET_SCORE}!</p>
        `;

        document.getElementById('finalScores').innerHTML = `
            <h3>Final Scores</h3>
            ${this.teamScores.map((score, i) => `
                <div class="final-score-row">
                    <span>${this.teamName(i)}</span>
                    <span>${score} pts</span>
                    <span>💰 ${this.teams[i].map(pi => this.players[pi].credits).join(' / ')} credits</span>
                </div>
            `).join('')}
        `;

        winScreen.classList.remove('hidden');
    }

    // ── Phu Si helper ─────────────────────────────────────────────────────────

    showPhusiPanel() {
        const panel = document.getElementById('phusiPanel');
        const content = document.getElementById('phusiContent');

        let context = 'general';
        if (this.playingPhase && this.teamScores.length > 0) {
            const myScore = this.teamScores[0];
            const maxOther = Math.max(...this.teamScores.slice(1));
            if (myScore > maxOther + 50) context = 'winning';
            else if (myScore < maxOther - 50) context = 'losing';
        }

        const tips = [];
        for (let i = 0; i < 3; i++) tips.push(phusiHint(context));

        content.innerHTML = tips.map(t => `<p class="phusi-tip-item">💡 ${t}</p>`).join('');
        panel.classList.remove('hidden');
    }

    // ── Social sharing ────────────────────────────────────────────────────────

    shareGame(platform) {
        const winnerName = this._lastWinnerTeam !== undefined
            ? this.teamName(this._lastWinnerTeam)
            : 'Play now';
        const score = this._lastWinnerTeam !== undefined
            ? `${this.teamScores[this._lastWinnerTeam]} pts`
            : '';
        const text = score
            ? `🃏 I just played Bisswiz – ${winnerName} won with ${score}! Play the Phu card game now!`
            : `🃏 Play Bisswiz – the Phu card game! Bet, win tricks, race to 500 pts!`;
        const url = 'https://phuquoc81.github.io/Bisswiz/';
        const encoded = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(url);

        const targets = {
            twitter:  `https://twitter.com/intent/tweet?text=${encoded}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`,
            whatsapp: `https://wa.me/?text=${encoded}%20${encodedUrl}`,
        };

        if (platform === 'copy') {
            const shareText = `${text} ${url}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    this.showMessage('✅ Link copied to clipboard!');
                }).catch(() => {
                    this.showMessage('📋 Copy: ' + shareText);
                });
            } else {
                this.showMessage('📋 ' + shareText);
            }
        } else if (targets[platform]) {
            window.open(targets[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    teamName(teamIndex) {
        return this.teams[teamIndex].map(i => this.players[i].name).join(' & ');
    }

    showMessage(msg) {
        const el = document.getElementById('gameMessage');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._msgTimer);
        this._msgTimer = setTimeout(() => el.classList.remove('show'), 3000);
    }
}

window.addEventListener('DOMContentLoaded', () => { new BisswizGame(); });


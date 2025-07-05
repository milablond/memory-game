   class MemoryGame {
            constructor() {
                this.gridSize = 4;
                this.cards = [];
                this.flippedCards = [];
                this.matchedPairs = 0;
                this.totalPairs = 0;
                this.clicks = 0;
                this.startTime = null;
                this.timerInterval = null;
                this.isProcessing = false;
               
                this.shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
                this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'];
               
                this.doubtMessages = [
                    "Tu es sûr(e) ?",
                    "Réfléchis bien...",
                    "C'est vraiment ton choix ?",
                    "Hmm... tu es certain(e) ?",
                    "Une dernière opportunité de changer d'avis !",
                    "Es-tu vraiment sûr(e) ?",
                    "Tu ne préfères pas reconsidérer ?",
                    "C'est ton dernier mot ?",
                    "Tu veux vraiment cliquer là ?"
                ];
               
                this.successMessages = [
                    "Bien joué !",
                    "Excellent !",
                    "Magnifique !",
                    "Tu es fort(e) !"
                ];
               
                this.initializeElements();
                this.bindEvents();
                this.initializeGame();
            }
           
            initializeElements() {
                this.gridSizeSelect = document.getElementById('gridSize');
                this.newGameBtn = document.getElementById('newGame');
                this.gameBoard = document.getElementById('gameBoard');
                this.clicksDisplay = document.getElementById('clicks');
                this.timerDisplay = document.getElementById('timer');
                this.pairsDisplay = document.getElementById('pairs');
                this.totalPairsDisplay = document.getElementById('totalPairs');
                this.pairPopup = document.getElementById('pairPopup');
                this.popupMessage = document.getElementById('popupMessage');
                this.gameOverPopup = document.getElementById('gameOverPopup');
                this.playAgainBtn = document.getElementById('playAgain');
                this.finalTime = document.getElementById('finalTime');
                this.finalClicks = document.getElementById('finalClicks');
                this.doubtTooltip = document.getElementById('doubtTooltip');
            }
           
            bindEvents() {
                this.newGameBtn.addEventListener('click', () => this.initializeGame());
                this.playAgainBtn.addEventListener('click', () => {
                    this.hidePopup(this.gameOverPopup);
                    this.initializeGame();
                });
               
                this.gridSizeSelect.addEventListener('change', () => {
                    this.gridSize = parseInt(this.gridSizeSelect.value);
                    this.initializeGame();
                });
               
                // Fermer les popups en cliquant dessus
                this.pairPopup.addEventListener('click', () => this.hidePopup(this.pairPopup));
                this.gameOverPopup.addEventListener('click', (e) => {
                    if (e.target === this.gameOverPopup) {
                        this.hidePopup(this.gameOverPopup);
                    }
                });
            }
           
            initializeGame() {
                this.gridSize = parseInt(this.gridSizeSelect.value);
                this.totalPairs = (this.gridSize * this.gridSize) / 2;
                this.matchedPairs = 0;
                this.clicks = 0;
                this.flippedCards = [];
                this.isProcessing = false;
                this.startTime = null;
               
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
               
                this.timerDisplay.textContent = "00:00";
                this.updateStats();
                this.createCards();
                this.renderBoard();
            }
           
            createCards() {
                this.cards = [];
                const combinations = this.generateCombinations();
               
                // Code les paires
                for (let i = 0; i < this.totalPairs; i++) {
                    const combo = combinations[i % combinations.length];
                    this.cards.push({...combo}, {...combo});
                }
               
                // Mélanger les cartes
                this.shuffleArray(this.cards);
            }
           
            generateCombinations() {
                const combinations = [];
                let index = 0;
               
                for (let shape of this.shapes) {
                    for (let color of this.colors) {
                        combinations.push({ shape, color, id: index++ });
                    }
                }
               
                return this.shuffleArray(combinations);
            }
           
            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
           
            renderBoard() {
                this.gameBoard.innerHTML = '';
                this.gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
               
                this.cards.forEach((card, index) => {
                    const cardElement = this.createCardElement(card, index);
                    this.gameBoard.appendChild(cardElement);
                });
            }
           
            createCardElement(card, index) {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.dataset.index = index;
               
                const shape = document.createElement('div');
                shape.className = `shape ${card.shape} color-${card.color}`;
                cardDiv.appendChild(shape);
               
                // Événements de la carte
                cardDiv.addEventListener('click', () => this.handleCardClick(index));
                cardDiv.addEventListener('mouseenter', (e) => this.handleCardHover(e, index));
                cardDiv.addEventListener('mouseleave', () => this.hideDoubtTooltip());
               
                return cardDiv;
            }
           
            handleCardClick(index) {
                if (this.isProcessing) return;
               
                const cardElement = document.querySelector(`[data-index="${index}"]`);
               
                if (cardElement.classList.contains('flipped') ||
                    cardElement.classList.contains('matched')) {
                    return;
                }
               
                if (!this.startTime) {
                    this.startTimer();
                }
               
                this.clicks++;
                this.updateStats();
                this.hideDoubtTooltip();
               
                // Retourner la carte
                this.flipCard(cardElement, index);
                this.flippedCards.push({ element: cardElement, index, card: this.cards[index] });
               
                // Vérifier s'il y a deux cartes retournées
                if (this.flippedCards.length === 2) {
                    this.isProcessing = true;
                    setTimeout(() => this.checkMatch(), 1000);
                }
            }
           
            handleCardHover(event, index) {
                const cardElement = event.target.closest('.card');
               
                if (cardElement.classList.contains('flipped') ||
                    cardElement.classList.contains('matched') ||
                    this.flippedCards.length >= 2) {
                    return;
                }
               
                // Message de doute
                if (Math.random() < 0.3) {
                    this.showDoubtTooltip(event);
                }
            }
           
            showDoubtTooltip(event) {
                const message = this.doubtMessages[Math.floor(Math.random() * this.doubtMessages.length)];
                this.doubtTooltip.textContent = message;
               
                const rect = event.target.getBoundingClientRect();
                const tooltipRect = this.doubtTooltip.getBoundingClientRect();
               
                let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                let top = rect.top - tooltipRect.height - 15;
               
                // Ajuster si le tooltip sort de l'écran
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }
                if (top < 10) top = rect.bottom + 10;
               
                this.doubtTooltip.style.left = left + 'px';
                this.doubtTooltip.style.top = top + 'px';
               
                this.doubtTooltip.classList.remove('hidden');
               
                // Masquer après 2 secondes
                setTimeout(() => this.hideDoubtTooltip(), 2000);
            }
           
            hideDoubtTooltip() {
                this.doubtTooltip.classList.add('hidden');
            }
           
            flipCard(cardElement, index) {
                cardElement.classList.add('flipped');
            }
           
            checkMatch() {
                const [first, second] = this.flippedCards;
               
                if (first.card.shape === second.card.shape &&
                    first.card.color === second.card.color) {
                    // C'est une paire
                    this.handleMatch();
                } else {
                    // Pas de paire donc retourner les cartes
                    this.handleNoMatch();
                }
               
                this.flippedCards = [];
                this.isProcessing = false;
            }
           
            handleMatch() {
                this.flippedCards.forEach(item => {
                    item.element.classList.add('matched');
                });
               
                this.matchedPairs++;
                this.updateStats();
                this.showSuccessPopup();
               
                // Vérifier si le jeu est terminé
                if (this.matchedPairs === this.totalPairs) {
                    setTimeout(() => this.endGame(), 1500);
                }
            }
           
            handleNoMatch() {
                this.flippedCards.forEach(item => {
                    item.element.classList.remove('flipped');
                });
            }
           
            showSuccessPopup() {
                const message = this.successMessages[Math.floor(Math.random() * this.successMessages.length)];
                this.popupMessage.textContent = message;
                this.showPopup(this.pairPopup);
               
                // Masquer automatiquement après 1.5 secondes
                setTimeout(() => this.hidePopup(this.pairPopup), 1500);
            }
           
            showPopup(popup) {
                popup.classList.remove('hidden');
            }
           
            hidePopup(popup) {
                popup.classList.add('hidden');
            }
           
            startTimer() {
                this.startTime = Date.now();
                this.timerInterval = setInterval(() => {
                    const elapsed = Date.now() - this.startTime;
                    const minutes = Math.floor(elapsed / 60000);
                    const seconds = Math.floor((elapsed % 60000) / 1000);
                    this.timerDisplay.textContent =
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }, 1000);
            }
           
            updateStats() {
                this.clicksDisplay.textContent = this.clicks;
                this.pairsDisplay.textContent = this.matchedPairs;
                this.totalPairsDisplay.textContent = this.totalPairs;
            }
           
            endGame() {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
               
                const elapsed = Date.now() - this.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
               
                this.finalTime.textContent = timeString;
                this.finalClicks.textContent = this.clicks;
               
                setTimeout(() => this.showPopup(this.gameOverPopup), 500);
            }
        }

        // Initialiser le jeu quand la page est chargée
        document.addEventListener('DOMContentLoaded', () => {
            new MemoryGame();
        });
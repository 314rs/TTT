/* let socket = new WebSocket("ws://localhost:8765")

socket.onmessage = event => {
    console.log(event.data);
} */

class TttNode extends HTMLElement
{
    static patterns = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

    
    get index() {
        return Array.from(this.parentElement.children).indexOf(this);
    }
    
    get depth() {
        return parseInt(this.getAttribute("depth"));
    }

    set depth(val) {
        this.setAttribute("depth", val);
        return val;
    }

    full() {
        this.setAttribute("full", "");
        for (const node of this.children) {
            node.full()
        }
    }

    setStone() {
        if (this.closest("ttt-game").whosTurn == 1) {
            this.setAttribute("p","1");
            this.closest("ttt-game").whosTurn = 2;
        } else {
            this.setAttribute("p", "2");
            this.closest("ttt-game").whosTurn = 1;
        }
        this.full();
    }
    
    constructor() 
    {
        super();
        
    }
    
    connectedCallback() 
    {
        if (this.depth < 0) {
            alert("Error: ttt-node with depth < 0 exists.");
        } else if (this.depth == 0) {
            if (this.parentElement.depth == 1) {
                this.addEventListener("click", e => {
                    if (!this.hasAttribute("full") && this.hasAttribute("active")) {
                        this.setStone();
                        for (const node of TttGame.actives) {
                            node.removeAttribute("active");
                        }
                        TttGame.actives = [];
                        this.parentElement.checkWinner([this.index]);
                    }
                });   
            }
            TttGame.actives.push(this);
            this.setAttribute("active", "");        
        } else {
            for (let i = 0; i < 9; i++) {
                var child = new TttNode()
                child.setAttribute("depth", this.depth-1)
                this.appendChild(child).cloneNode(true);
            } 
            this.style.borderWidth = (3 * this.depth) + "px";
        }
    }

    checkWinner(pos) {
        if (this.depth == 0) {
            alert("Error: checkWinner was called on leaf");
            return;
        }

        // create array of state
        let state = Array.from(this.children).map((child) => {
            if (child.hasAttribute("p")) {
                return parseInt(child.getAttribute("p"));
            } else {
                return 0;
            }
        });

        for (const line of TttNode.patterns) {
            let lineSet = new Set(line.map((index) => state[index]));
            if (lineSet.size == 1 && ! lineSet.has(0)) {
                this.setAttribute("p", lineSet.values().next().value);
                this.full();
                pos.push(this.index); 
                this.parentElement.checkWinner(pos);
                return;
            } 
        }

        if (Array.from(this.children).filter(child => child.hasAttribute("full")).length == 9) {
            this.full();
            pos.push(this.index); 
            this.parentElement.checkWinner(pos);
            return;
        }

        this.parentElement.findActive(pos);
    }

    findActive(pos) {
        if (this.depth == 1) {
            this.markActive();
        } else {
            const index = pos.pop();
            if (!this.children[index].hasAttribute("full")) {
                this.children[index].findActive(pos);
            } else {
                this.markActive();
            }
        }
    }

    markActive() {
        if (!this.hasAttribute("full")) {
            if (this.depth == 0) {
                this.setAttribute("active", "");
                TttGame.actives.push(this);
            } else {
                for (const leaf of this.children) {
                    leaf.markActive();
                }
            }
        } 
    }
}
customElements.define("ttt-node", TttNode);

class TttGame extends HTMLElement {

    static actives = [];
    whosTurn = 1;


    set depth(val) {
        this.setAttribute("depth", val);
        return val;
    }
    get depth() {
        return parseInt(this.getAttribute("depth"));
    }

    constructor() 
    {
        super();
    }

    connectedCallback() {
        if (this.depth > 0) {
            for (let i = 0; i < 9; i++) {
                var child = new TttNode()
                child.setAttribute("depth", this.depth - 1)
                this.appendChild(child).cloneNode(true);
            } 
        }
    }

    findActive(pos) {
        const index = pos.pop();
            if (!this.children[index].hasAttribute("full")) {
                this.children[index].findActive(pos);
            } else {
                this.markActive();
            }
    }



}
customElements.define("ttt-game", TttGame);

function autoplay() {
    TttGame.actives[Math.floor(Math.random() * (TttGame.actives.length))].click();
    setTimeout(autoplay, 10);
}

function startAutoplay() {
    document.getElementById("autoplay").remove();
    setTimeout(autoplay, 10);
} 
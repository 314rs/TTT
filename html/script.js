
class TttLeaf extends HTMLElement 
{
    static whosTurn = 1;
    static start = true;
    static actives = [];

    get index() {
        return Array.from(this.parentElement.children).indexOf(this);
    }

    full() {
        this.setAttribute("full", "");
    }

    constructor() 
    {
        super();
        this.addEventListener("click", e => {
            if (! this.hasAttribute("p") && ! this.parentElement.hasAttribute("p") && ! this.hasAttribute("full") && this.hasAttribute("active") || TttLeaf.start) {
                this.setStone();
                for (const node of TttLeaf.actives) {
                    node.removeAttribute("active");
                }
                TttLeaf.actives = [];
                this.parentElement.checkWinner([this.index]);
                TttLeaf.start = false;
            }

        });
    }

    connectedCallback() {
        TttLeaf.actives.push(this);
        this.setAttribute("active", "");
    }

    setStone() {
        if (TttLeaf.whosTurn == 1) {
            this.setAttribute("p","1");
            TttLeaf.whosTurn = 2;
        } else {
            this.setAttribute("p", "2");
            TttLeaf.whosTurn = 1;
        }
        this.setAttribute("full", "");
    }

    markActive() {
        if (!this.hasAttribute("full")) {
            this.setAttribute("active", "");
            TttLeaf.actives.push(this);
        }
    }

    
}
customElements.define("ttt-leaf", TttLeaf);



class TttNode extends HTMLElement
{
    static maxdepth = 0;

    constructor() 
    {
        super();
    }

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

    connectedCallback() 
    {
        TttNode.maxdepth = Math.max(this.depth, TttNode.maxdepth);

        if (this.depth == 1) {
            for (let i = 0; i < 9; i++) {
                this.appendChild(document.createElement("ttt-leaf"));      
            }      
        } else if (this.depth > 1) {
            for (let i = 0; i < 9; i++) {
                var child = new TttNode()
                child.setAttribute("depth", this.depth-1)
                this.appendChild(child).cloneNode(true);
            } 
        }
        if (this.depth == TttNode.maxdepth) {
            this.setAttribute("rootnode", "");
        }

        this.style.borderWidth = (3 * this.depth) + "px";
    }

    checkWinner(pos) {
              
        let state = Array.from(this.children).map((child) => {
            if (child.hasAttribute("p")) {
                return parseInt(child.getAttribute("p"));
            } else {
                return 0;
            }
        });
        const patterns = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];

        for (const line of patterns) {
            let lineSet = new Set(line.map((index) => state[index]));
            if (lineSet.size == 1 && ! lineSet.has(0)) {
                this.setAttribute("p", lineSet.values().next().value);
                this.full();
                pos.push(this.index); 
                if (this.depth < TttNode.maxdepth) {
                    this.parentElement.checkWinner(pos);
                } else {
                    console.log("end!")
                }
                return;
            } 
        }

        if (Array.from(this.children).filter(child => child.hasAttribute("full")).length == 9) {
            this.full();
            pos.push(this.index); 
            if (this.depth < TttNode.maxdepth) {
                this.parentElement.checkWinner(pos);
            } else {
                console.log("end!")
            }
           return;
        }

        if (this.depth < TttNode.maxdepth) {
            this.parentElement.findActive(pos);
        } else {
            this.markActive()
        }
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
            for (const leaf of this.children) {
                leaf.markActive();
            }
        } 
    }
}
customElements.define("ttt-node", TttNode);


function autoplay() {
    if (true/* TttLeaf.whosTurn == 1 */) {
        TttLeaf.actives[Math.floor(Math.random() * (TttLeaf.actives.length))].click();
    }
    setTimeout(autoplay, 10);
}

function startAutoplay() {
    document.getElementById("autoplay").remove();
    setTimeout(autoplay, 10);
} 

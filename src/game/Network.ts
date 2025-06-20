import { Peer } from "peerjs";

export class Network {
  private clients: Peer.DataConnection[] = [];
  private host: Peer.DataConnection | null = null;
  private peer: Peer | null = null;

  constructor() {}

  async initPeer() {
    if (this.peer) {
      return this.peer;
    }

    const hostId = window.location.hash?.substring(1) || null;

    const peerId = localStorage.getItem("peerId") || "";

    const peer = new Peer(peerId, { debug: 2 });

    peer.on("open", function (id) {
      console.log("My peer ID is: " + id);
      localStorage.setItem("peerId", id); // Store the peer ID in localStorage
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peer.on("disconnected", () => {
      console.log("Disconnected from PeerServer");
    });

    peer.on("close", () => {
      console.log("Connection closed");
    });

    peer.on("connection", (conn) => {
      console.log("Connection established with a client");
      conn.on("open", () => {
        console.log("Connected to client:", conn.peer);
        if (!hostId) {
          conn.send("Hello from host!");
        } else {
          conn.send("Hello from client!");
        }
      });

      conn.on("data", (data) => {
        console.log("Received data from client:", data);
      });
      conn.on("error", (err) => {
        console.error("Connection error:", err);
      });
      this.clients.push(conn);
    });

    this.peer = peer;
    return peer;
  }

  join(hostId: string) {
    const peer = this.peer;
    if (hostId) {
      setTimeout(() => {
        console.log("Connecting to PeerServer as a client");
        const conn = peer.connect(hostId);
        conn.on("open", () => {
          console.log("Connected to PeerServer as " + conn.peer);
        });
        conn.on("data", (data) => {
          console.log("Received data from " + conn.peer, data);
        });
        conn.on("error", (err) => {
          console.error("Connection error:", err);
        });
        conn.on("close", () => {
          console.log("Connection closed with " + conn.peer);
        });
        this.host = conn;
      }, 2000);
    }
  }
}

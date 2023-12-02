const schedule = require("node-schedule");
const admin = require("../config/index");

const db = admin.firestore();

const ticketExpiryJobs = new Map();

function setTicketExpired(ticketId) {
  const ticketRef = db.collection("tickets").doc(ticketId);
  return ticketRef.update({ status: "expired" });
}

function scheduleExpiry(ticketId, dueDate) {
  const ticketExpiryJob = schedule.scheduleJob(dueDate.toDate(), function () {
    setTicketExpired(ticketId);
  });

  ticketExpiryJobs.set(ticketId, ticketExpiryJob);
  console.log("Tickets scheduled for expiry");
}

function sendNofitication(ticketId, dateCreated, dueDate) {}

db.collection("tickets").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added" && change.doc.data().status === "unpaid") {
      scheduleExpiry(change.doc.id, change.doc.data().ticketDueDate);

      const licenseNumber = change.doc.data().licenseNumber;

      const licenseCollection = db.collection("licenses");
      const licenseQuery = licenseCollection
        .where("licenseNumber", "==", licenseNumber)
        .get();

      licenseQuery.then((snapshot) => {
        snapshot.forEach((doc) => {
      
        });
      });
    }
    if (change.type === "modified") {
      const ticketExpiryJob = ticketExpiryJobs.get(change.doc.id);
      if (ticketExpiryJob) {
        job.cancel();
        ticketExpiryJobs.delete(change.doc.id);
      }
    }
  });
});

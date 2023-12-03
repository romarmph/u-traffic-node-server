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

// For ticket expiry
db.collection("tickets").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added" && change.doc.data().status === "unpaid") {
      scheduleExpiry(change.doc.id, change.doc.data().ticketDueDate);
    }
    if (change.type === "modified") {
      const ticketExpiryJob = ticketExpiryJobs.get(change.doc.id);
      if (ticketExpiryJob) {
        ticketExpiryJob.cancel();
        ticketExpiryJobs.delete(change.doc.id);
      }
    }
  });
});

async function sendNewTicketNotification(ticketId, receiverId, ticketNumber) {
  const notificationsRef = db.collection("notifications");

  const snapshot = await notificationsRef
    .where("ticketId", "==", ticketId)
    .where("receiverId", "==", receiverId)
    .where("type", "==", "ticketUnpaid")
    .get();

  if (snapshot.docs.length != 0) {
    return;
  }

  const notification = {
    title: "Ticket Issued",
    body: `You have a new ticket - ${ticketNumber}`,
    read: false,
    ticketId: ticketId,
    receiverId: receiverId,
    createdAt: admin.firestore.Timestamp.now(),
    type: "ticketUnpaid",
  };

  notificationsRef.add(notification);
}

async function sendTicketCancelledNotification(
  ticketId,
  receiverId,
  ticketNumber
) {
  const notificationsRef = db.collection("notifications");

  const snapshot = await notificationsRef
    .where("ticketId", "==", ticketId)
    .where("receiverId", "==", receiverId)
    .where("type", "==", "ticketCancelled")
    .get();

  if (snapshot.docs.length != 0) {
    return;
  }

  const notification = {
    title: "Ticket Cancelled",
    body: `Your Ticket ${ticketNumber} has been cancelled`,
    read: false,
    ticketId: ticketId,
    receiverId: receiverId,
    createdAt: admin.firestore.Timestamp.now(),
    type: "ticketCancelled",
  };

  notificationsRef.add(notification);
}

async function sendTicketPaidNotification(ticketId, receiverId, ticketNumber) {
  const notificationsRef = db.collection("notifications");

  const snapshot = await notificationsRef
    .where("ticketId", "==", ticketId)
    .where("receiverId", "==", receiverId)
    .where("type", "==", "ticketPaid")
    .get();

  if (snapshot.docs.length != 0) {
    return;
  }

  const notification = {
    title: "Ticket Paid",
    body: `Your Ticket ${ticketNumber} has been paid`,
    read: false,
    ticketId: ticketId,
    receiverId: receiverId,
    createdAt: admin.firestore.Timestamp.now(),
    type: "tickePaid",
  };

  notificationsRef.add(notification);
}

async function sendTicketExpiredNotification(
  ticketId,
  receiverId,
  ticketNumber
) {
  const notificationsRef = db.collection("notifications");

  const snapshot = await notificationsRef
    .where("ticketId", "==", ticketId)
    .where("receiverId", "==", receiverId)
    .where("type", "==", "ticketExpired")
    .get();

  if (snapshot.docs.length != 0) {
    return;
  }

  const notification = {
    title: "Ticket Expired",
    body: `Your Ticket ${ticketNumber} has expired`,
    read: false,
    ticketId: ticketId,
    receiverId: receiverId,
    createdAt: admin.firestore.Timestamp.now(),
    type: "ticketExpired",
  };

  notificationsRef.add(notification);
}

// For notifications
db.collection("tickets").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added" && change.doc.data().status === "unpaid") {
      const ticketNumber = change.doc.data().ticketNumber;
      const licenseNumber = change.doc.data().licenseNumber;
      const plateNumber = change.doc.data().plateNumber;
      const chassisNumber = change.doc.data().chassisNumber;
      const engineNumber = change.doc.data().engineNumber;
      const conductionOrFileNumber = change.doc.data().conductionOrFileNumber;
      const ticektId = change.doc.id;

      if (licenseNumber && licenseNumber !== "") {
        const licenseCollection = db.collection("licenses");
        const licenseQuery = licenseCollection
          .where("licenseNumber", "==", licenseNumber)
          .get();

        licenseQuery.then((snapshot) => {
          snapshot.forEach((license) => {
            sendNewTicketNotification(
              ticektId,
              license.data().userID,
              ticketNumber
            );
          });
        });
      } else if (plateNumber && plateNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("plateNumber", "==", plateNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendNewTicketNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (chassisNumber && chassisNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("chassisNumber", "==", chassisNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendNewTicketNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (engineNumber && engineNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("engineNumber", "==", engineNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendNewTicketNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (conductionOrFileNumber && conductionOrFileNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("conductionOrFileNumber", "==", conductionOrFileNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendNewTicketNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else {
        console.log("No notification sent");
      }
    }

    if (
      change.type === "modified" &&
      change.doc.data().status === "cancelled"
    ) {
      const ticketNumber = change.doc.data().ticketNumber;
      const licenseNumber = change.doc.data().licenseNumber;
      const plateNumber = change.doc.data().plateNumber;
      const chassisNumber = change.doc.data().chassisNumber;
      const engineNumber = change.doc.data().engineNumber;
      const conductionOrFileNumber = change.doc.data().conductionOrFileNumber;
      const ticektId = change.doc.id;

      console.log("Cancelling ticket");

      if (licenseNumber && licenseNumber !== "") {
        const licenseCollection = db.collection("licenses");
        const licenseQuery = licenseCollection
          .where("licenseNumber", "==", licenseNumber)
          .get();

        licenseQuery.then((snapshot) => {
          snapshot.forEach((license) => {
            sendTicketCancelledNotification(
              ticektId,
              license.data().userID,
              ticketNumber
            );
          });
        });
      } else if (plateNumber && plateNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("plateNumber", "==", plateNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketCancelledNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (chassisNumber && chassisNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("chassisNumber", "==", chassisNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketCancelledNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (engineNumber && engineNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("engineNumber", "==", engineNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketCancelledNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (conductionOrFileNumber && conductionOrFileNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("conductionOrFileNumber", "==", conductionOrFileNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketCancelledNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else {
        console.log("No notification sent");
      }
    }

    if (change.type === "modified" && change.doc.data().status === "paid") {
      const ticketNumber = change.doc.data().ticketNumber;
      const licenseNumber = change.doc.data().licenseNumber;
      const plateNumber = change.doc.data().plateNumber;
      const chassisNumber = change.doc.data().chassisNumber;
      const engineNumber = change.doc.data().engineNumber;
      const conductionOrFileNumber = change.doc.data().conductionOrFileNumber;
      const ticektId = change.doc.id;

      if (licenseNumber && licenseNumber !== "") {
        const licenseCollection = db.collection("licenses");
        const licenseQuery = licenseCollection
          .where("licenseNumber", "==", licenseNumber)
          .get();

        licenseQuery.then((snapshot) => {
          snapshot.forEach((license) => {
            sendTicketPaidNotification(
              ticektId,
              license.data().userID,
              ticketNumber
            );
          });
        });
      } else if (plateNumber && plateNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("plateNumber", "==", plateNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketPaidNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (chassisNumber && chassisNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("chassisNumber", "==", chassisNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketPaidNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (engineNumber && engineNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("engineNumber", "==", engineNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketPaidNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (conductionOrFileNumber && conductionOrFileNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("conductionOrFileNumber", "==", conductionOrFileNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketPaidNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else {
        console.log("No notification sent");
      }
    }

    if (change.type === "modified" && change.doc.data().status === "expired") {
      const ticketNumber = change.doc.data().ticketNumber;
      const licenseNumber = change.doc.data().licenseNumber;
      const plateNumber = change.doc.data().plateNumber;
      const chassisNumber = change.doc.data().chassisNumber;
      const engineNumber = change.doc.data().engineNumber;
      const conductionOrFileNumber = change.doc.data().conductionOrFileNumber;
      const ticektId = change.doc.id;

      if (licenseNumber && licenseNumber !== "") {
        const licenseCollection = db.collection("licenses");
        const licenseQuery = licenseCollection
          .where("licenseNumber", "==", licenseNumber)
          .get();

        licenseQuery.then((snapshot) => {
          snapshot.forEach((license) => {
            sendTicketExpiredNotification(
              ticektId,
              license.data().userID,
              ticketNumber
            );
          });
        });
      } else if (plateNumber && plateNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("plateNumber", "==", plateNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketExpiredNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (chassisNumber && chassisNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("chassisNumber", "==", chassisNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketExpiredNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (engineNumber && engineNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("engineNumber", "==", engineNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketExpiredNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else if (conductionOrFileNumber && conductionOrFileNumber !== "") {
        const vehicleCollection = db.collection("driver_vehicles");
        const vehicleQuery = vehicleCollection
          .where("conductionOrFileNumber", "==", conductionOrFileNumber)
          .get();

        vehicleQuery.then((snapshot) => {
          snapshot.forEach((vehicle) => {
            console.log(`Vehicle ID: ${vehicle.data().driverId}`);
            sendTicketExpiredNotification(
              ticektId,
              vehicle.data().driverId,
              ticketNumber
            );
          });
        });
      } else {
        console.log("No notification sent");
      }
    }
  });
});

// Notification model from dart
// class Notification {
//   final String? id;
//   final String title;
//   final String body;
//   final String? ticketId;
//   final bool read;
//   final String? receiverId;
//   final Timestamp createdAt;

//   Notification({
//     this.id,
//     required this.title,
//     required this.body,
//     this.ticketId,
//     this.read = false,
//     this.receiverId,
//     required this.createdAt,
//   });

//   factory Notification.fromJson(Map<String, dynamic> json, String id) {
//     return Notification(
//       id: id,
//       title: json['title'],
//       body: json['body'],
//       ticketId: json['ticketId'],
//       read: json['read'],
//       receiverId: json['receiverId'],
//       createdAt: json['createdAt'],
//     );
//   }
// }
// class Ticket {
//   String? id;
//   int? ticketNumber;
//   final String? licenseNumber;
//   final String? driverName;
//   final String? phone;
//   final String? email;
//   final String? address;
//   final String vehicleTypeID;
//   final String vehicleTypeName;
//   final String? engineNumber;
//   final String? chassisNumber;
//   final String? plateNumber;
//   final String? conductionOrFileNumber;
//   final String? vehicleOwner;
//   final String? vehicleOwnerAddress;
//   final String enforcerID;
//   final String enforcerName;
//   final double totalFine;
//   final Timestamp? birthDate;
//   final Timestamp dateCreated;
//   final Timestamp ticketDueDate;
//   final Timestamp violationDateTime;
//   final List<IssuedViolation> issuedViolations;
//   final ULocation violationPlace;
//   final TicketStatus status;
//   final String? cancelledBy;
//   final Timestamp? cancelledAt;

//   Ticket({
//     this.id,
//     this.ticketNumber,
//     required this.licenseNumber,
//     required this.driverName,
//     required this.phone,
//     required this.email,
//     required this.address,
//     required this.vehicleTypeID,
//     required this.vehicleTypeName,
//     required this.engineNumber,
//     required this.conductionOrFileNumber,
//     required this.chassisNumber,
//     required this.plateNumber,
//     required this.vehicleOwner,
//     required this.vehicleOwnerAddress,
//     required this.enforcerID,
//     required this.enforcerName,
//     required this.status,
//     required this.birthDate,
//     required this.dateCreated,
//     required this.ticketDueDate,
//     required this.violationDateTime,
//     required this.violationPlace,
//     required this.issuedViolations,
//     required this.totalFine,
//     this.cancelledBy,
//     this.cancelledAt,
//   });
// }

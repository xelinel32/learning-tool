import { db } from '@/firebaseConfig';

// These functions all relate to loading firebase data for a specific user.

async function getUserGroups(uid) {
  try {
    const querySnapshot = await db
      .collection('study-groups')
      .where('members', 'array-contains', uid)
      .get();
    let groupList = [];
    querySnapshot.forEach((doc) => {
      groupList.push({
        className: doc.data().className,
        membersLength: doc.data().members.length,
        groupID: doc.id,
      });
    });
    return Promise.all(groupList);
  } catch (error) {
    console.log('getUserGroup: ' + error);
  }
}

function getUserData(uid) {
  return new Promise((resolve, reject) => {
    db.collection('users')
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          resolve(doc.data());
        } else {
          reject('Пользователь не найден.');
        }
      });
  });
}

export { getUserData, getUserGroups };

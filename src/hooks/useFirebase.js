import { useState, useEffect } from 'react';
import { database } from '../config/firebase';
import { ref, onValue, update, get, remove } from 'firebase/database';

export const useChildData = (childId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    const childRef = ref(database, `users/childs/${childId}`);
    const unsubscribe = onValue(
      childRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [childId]);

  return { data, loading, error };
};

export const useChildrenList = (parentEmail) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentEmail) {
      setLoading(false);
      return;
    }

    const childsRef = ref(database, 'users/childs');
    const unsubscribe = onValue(
      childsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allChildren = snapshot.val();
          const filtered = Object.keys(allChildren)
            .filter((key) => {
              const childParentEmail = allChildren[key].parentEmail;
              const matches = childParentEmail === parentEmail;
              return matches;
            })
            .map((key) => ({
              id: key,
              ...allChildren[key],
            }));
          setChildren(filtered);
        } else {
          setChildren([]);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [parentEmail]);

  return { children, loading, error };
};

export const updateBlockedApp = async (childId, appIndex, blocked) => {
  try {
    // Update just the blocked field of the specific app
    const appRef = ref(database, `users/childs/${childId}/apps/${appIndex}`);
    await update(appRef, { blocked });
    return { success: true };
  } catch (error) {
    console.error('Error updating blocked app:', error);
    return { success: false, error };
  }
};

export const getAppData = async (childId, appIndex) => {
  try {
    const appRef = ref(database, `users/childs/${childId}/apps/${appIndex}`);
    const snapshot = await get(appRef);
    return snapshot.val() || {};
  } catch (error) {
    return {};
  }
};

export const toggleDeviceLock = async (childId, locked) => {
  try {
    const deviceRef = ref(database, `users/childs/${childId}`);
    await update(deviceRef, { deviceLocked: locked });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const useNsfwIncidents = (childId) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    const incidentsRef = ref(database, `users/childs/${childId}/nsfw_incidents`);
    const unsubscribe = onValue(
      incidentsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const parsedIncidents = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // newest first
          
          setIncidents(parsedIncidents);
        } else {
          setIncidents([]);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [childId]);

  return { incidents, loading, error };
};

export const deleteNsfwIncident = async (childId, incidentId) => {
  try {
    const incidentRef = ref(database, `users/childs/${childId}/nsfw_incidents/${incidentId}`);
    await remove(incidentRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting NSFW incident:', error);
    return { success: false, error };
  }
};
// Parent-controlled helper: set or clear the `appDeleted` flag on the child record.
export const setAppDeleted = async (childId, deleted) => {
  try {
    const childRef = ref(database, `users/childs/${childId}`);
    await update(childRef, { appDeleted: deleted });
    return { success: true };
  } catch (error) {
    console.error('Error setting appDeleted flag:', error);
    return { success: false, error };
  }
};

// Update child's name
export const updateChildName = async (childId, newName) => {
  try {
    const childRef = ref(database, `users/childs/${childId}`);
    await update(childRef, { name: newName });
    return { success: true };
  } catch (error) {
    console.error('Error updating child name:', error);
    return { success: false, error };
  }
};

// Update child's gender
export const updateChildGender = async (childId, newGender) => {
  try {
    const childRef = ref(database, `users/childs/${childId}`);
    await update(childRef, { gender: newGender });
    return { success: true };
  } catch (error) {
    console.error('Error updating child gender:', error);
    return { success: false, error };
  }
};

export const useParentProfile = (parentUid) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentUid) {
      setLoading(false);
      return;
    }

    const parentRef = ref(database, `users/parents/${parentUid}`);
    const unsubscribe = onValue(
      parentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.val());
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [parentUid]);

  return { profile, loading, error };
};

// Update content filters for a child
export const updateContentFilters = async (childId, filters) => {
  try {
    const filtersRef = ref(database, `users/childs/${childId}/contentFilters`);
    await update(filtersRef, {
      ...filters,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating content filters:', error);
    return { success: false, error };
  }
};

export const approveLogoutRequest = async (childId) => {
    try {
        const childRef = ref(database, `users/childs/${childId}`);
        await update(childRef, { logoutRequest: 'approved' });
        return { success: true };
    } catch (error) {
        console.error("Error approving logout request:", error);
        return { success: false, error };
    }
};

export const denyLogoutRequest = async (childId) => {
    try {
        const childRef = ref(database, `users/childs/${childId}`);
        await update(childRef, { logoutRequest: 'none' });
        return { success: true };
    } catch (error) {
        console.error("Error denying logout request:", error);
        return { success: false, error };
    }
};

export const deleteChild = async (childId) => {
  try {
    const childRef = ref(database, `users/childs/${childId}`);
    await remove(childRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting child:', error);
    return { success: false, error };
  }
};


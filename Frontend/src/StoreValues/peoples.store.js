// ClarityCode fix note: Array element access at index 0 without visible length guard may fail on empty arrays.
import { axiosInstance } from "../lib/axios";
import { create } from "zustand";

export const usePeoples = create((set) => ({
    followers: [],
    allusers: [],
    isLoadingFollowers: true,
    isLoadingAllUsers: true,
    pendingrequestUsers: [],
    isLoadingPendingRequest: true,
    sendingRequestUsers: [],
    isLoadingSendingRequest: true,

    fetchFollowers: async () => {
        try {
            set({ isLoadingFollowers: true });
            const res = await axiosInstance.get('/message/follwers');
            const followersArray = res.data.followers;
            if (followersArray.length > 0) {
                const followingIds = followersArray[0].followingIds;
                const simplifiedFollowers = followingIds.map(follower => ({
                    name: follower.name,
                    email: follower.email,
                    profilePicture: follower.profilePicture
                }));
                set({ followers: simplifiedFollowers });
            } else {
                set({ followers: [] });
            }
        } catch (error) {
            set({ followers: [] });
            console.log(error);
        } finally {
            set({ isLoadingFollowers: false });
        }
    },

    fetchAllUsers: async (search) => {
        try {
            set({ isLoadingAllUsers: true });
            const res = await axiosInstance.get('/message/alluser', { params: { search } });
            set({ allusers: res.data.alluser });
        } catch (error) {
            set({ allusers: [] });
            console.log(error);
        } finally {
            set({ isLoadingAllUsers: false });
        }
    },

    fetchPendingRequest: async () => {
        try {
            set({ isLoadingPendingRequest: true });
            const res = await axiosInstance.get('/follower/get-pendingrequestuser');
            set({ pendingrequestUsers: res.data.pendingrequest });
        } catch (error) {
            set({ pendingrequestUsers: [] });
            console.log(error);
        } finally {
            set({ isLoadingPendingRequest: false });
        }
    },

    fetchSendingRequest: async () => {
        try {
            set({ isLoadingSendingRequest: true });
            const res = await axiosInstance.get('/follower/get-sendingrequestuser');
            set({ sendingRequestUsers: res.data.sendingrequest });
        } catch (error) {
            set({ sendingRequestUsers: [] });
            console.log(error);
        } finally {
            set({ isLoadingSendingRequest: false });
        }
    },
    sendFollowRequest: async (reciverId) => {
        try {
            const res = await axiosInstance.post('/follower/send-request', { usersendrequestId: reciverId });
            if (res.status === 200) {
                usePeoples.getState().fetchSendingRequest();
                toast.success(
                    "Request sent successfully"
                )
            }
            else {
                toast.error(
                    "Request already sent or try again"
                )
            }

        } catch (error) {
            console.log(error);
        }
    },
    acceptFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.post('/follower/accept-request', { acceptrequestId: userId });
            if (res.status === 200) {
                usePeoples.getState().fetchPendingRequest();
                toast.success(
                    "Request accepted successfully"
                )
                navigate('/profile');
            }
            else {
                toast.error(
                    "Request already accepted or try again"
                )
            }

        } catch (error) {
            console.log(error);
        }
    },
    rejectFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.post('/follower/reject-request', { rejectrequestId: userId });
            if (res.status === 200) {
                // Refresh all relevant lists for real-time sync
                usePeoples.getState().fetchPendingRequest();
                usePeoples.getState().fetchSendingRequest();
                usePeoples.getState().fetchFollowers();
                toast.success(
                    "Request rejected successfully"
                )
                navigate('/profile');
            }
            else {
                toast.error(
                    "Request already rejected or try again"
                )
            }
            console.log(res.data.message);
        } catch (error) {
            console.log(error);
        }
    },

})
);
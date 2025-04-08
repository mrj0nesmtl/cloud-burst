/**
 * Types for invitation statistics
 */

/**
 * Overall invitation statistics for an event
 */
export interface InvitationStats {
  /**
   * Total number of invitations sent for the event
   */
  total: number;
  
  /**
   * Number of invitations that have been opened
   */
  opened: number;
  
  /**
   * Number of RSVPs received (both attending and not attending)
   */
  responded: number;
  
  /**
   * Number of guests who confirmed they will attend
   */
  attending: number;
  
  /**
   * Number of guests who confirmed they cannot attend
   */
  notAttending: number;
  
  /**
   * Number of invitations that have not been responded to
   */
  pending: number;
  
  /**
   * Percentage of invitations that have been opened
   */
  openRate: number;
  
  /**
   * Percentage of invitations that have received a response
   */
  responseRate: number;
  
  /**
   * Percentage of invitations that confirmed attendance
   */
  attendanceRate: number;
} 
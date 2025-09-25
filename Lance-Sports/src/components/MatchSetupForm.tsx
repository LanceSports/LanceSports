import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Save, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Match, Team } from '../types/match.ts';
import { toast } from 'sonner';

interface MatchSetupFormProps {
  teams: Team[];
  onCreate?: (match: Omit<Match, 'id'>) => void;
}

interface MatchFormData {
  league: string;
  venue: string;
  scheduledStart: string;
  homeTeamId: string;
  awayTeamId: string;
  notes: string;
}

const initialFormData: MatchFormData = {
  league: '',
  venue: '',
  scheduledStart: '',
  homeTeamId: '',
  awayTeamId: '',
  notes: ''
};

export function MatchSetupForm({ teams, onCreate }: MatchSetupFormProps) {
  const [formData, setFormData] = useState<MatchFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<MatchFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<MatchFormData> = {};

    if (!formData.league.trim()) {
      newErrors.league = 'League is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.scheduledStart) {
      newErrors.scheduledStart = 'Kickoff time is required';
    } else {
      const kickoffDate = new Date(formData.scheduledStart);
      const now = new Date();
      if (kickoffDate <= now) {
        newErrors.scheduledStart = 'Kickoff time must be in the future';
      }
    }

    if (!formData.homeTeamId) {
      newErrors.homeTeamId = 'Home team is required';
    }

    if (!formData.awayTeamId) {
      newErrors.awayTeamId = 'Away team is required';
    }

    if (formData.homeTeamId && formData.awayTeamId && formData.homeTeamId === formData.awayTeamId) {
      newErrors.homeTeamId = 'Home and away teams must be different';
      newErrors.awayTeamId = 'Home and away teams must be different';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const newMatch: Omit<Match, 'id'> = {
        league: formData.league,
        venue: formData.venue,
        scheduledStart: formData.scheduledStart,
        status: 'SCHEDULED',
        clock: '00:00',
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        scoreHome: 0,
        scoreAway: 0
      };

      onCreate?.(newMatch);
      
      // Reset form
      setFormData(initialFormData);
      setErrors({});
      
      toast.success('Match created successfully!');
    } catch (error) {
      toast.error('Failed to create match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const updateFormData = (field: keyof MatchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const homeTeam = teams.find(t => t.id === formData.homeTeamId);
  const awayTeam = teams.find(t => t.id === formData.awayTeamId);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Create New Match</h2>
          </div>
          <p className="text-muted-foreground">
            Set up a new match with teams, schedule, and venue details.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Match Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Match Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="league">League *</Label>
                  <Input
                    id="league"
                    placeholder="e.g., Premier League, Championship"
                    value={formData.league}
                    onChange={(e) => updateFormData('league', e.target.value)}
                    className={errors.league ? 'border-destructive' : ''}
                  />
                  {errors.league && (
                    <p className="text-sm text-destructive mt-1">{errors.league}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="venue">Venue *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="venue"
                      placeholder="e.g., Wembley Stadium"
                      value={formData.venue}
                      onChange={(e) => updateFormData('venue', e.target.value)}
                      className={`pl-10 ${errors.venue ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.venue && (
                    <p className="text-sm text-destructive mt-1">{errors.venue}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="scheduledStart">Kickoff Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    value={formData.scheduledStart}
                    onChange={(e) => updateFormData('scheduledStart', e.target.value)}
                    className={`pl-10 ${errors.scheduledStart ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.scheduledStart && (
                  <p className="text-sm text-destructive mt-1">{errors.scheduledStart}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Teams Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="homeTeam">Home Team *</Label>
                  <Select
                    value={formData.homeTeamId}
                    onValueChange={(value) => updateFormData('homeTeamId', value)}
                  >
                    <SelectTrigger className={errors.homeTeamId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem 
                          key={team.id} 
                          value={team.id}
                          disabled={team.id === formData.awayTeamId}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.primaryColor || '#7C3AED' }}
                            />
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.homeTeamId && (
                    <p className="text-sm text-destructive mt-1">{errors.homeTeamId}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="awayTeam">Away Team *</Label>
                  <Select
                    value={formData.awayTeamId}
                    onValueChange={(value) => updateFormData('awayTeamId', value)}
                  >
                    <SelectTrigger className={errors.awayTeamId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem 
                          key={team.id} 
                          value={team.id}
                          disabled={team.id === formData.homeTeamId}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.primaryColor || '#7C3AED' }}
                            />
                            <span>{team.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.awayTeamId && (
                    <p className="text-sm text-destructive mt-1">{errors.awayTeamId}</p>
                  )}
                </div>
              </div>

              {/* Match Preview */}
              {homeTeam && awayTeam && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Match Preview:</p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-1">Home</Badge>
                      <p className="font-medium">{homeTeam.name}</p>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
                    <div className="text-center">
                      <Badge variant="outline" className="mb-1">Away</Badge>
                      <p className="font-medium">{awayTeam.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Notes section */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional match information, referee details, etc."
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Match'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useCallback, useEffect, useState } from 'react';
import { Input, Text } from '@ui-kitten/components';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserContext } from '@/contexts/UserContext';
import theme from "../../theme.json"
import { FamilyMember } from '@/types/Entity';
import * as Device from 'expo-device';

interface InputWithAutocompleteProps {
  getMemberNameValue: (name: string) => void;
  placeholder: string;
}

const InputWithAutocomplete: React.FC<InputWithAutocompleteProps> = ({getMemberNameValue, placeholder}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FamilyMember[]>([]);
  const {user} = useUserContext()
  const [membersForUser, setMembersForUser] = useState<FamilyMember[]>([])
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  useEffect(() => {
    if(user?.members) {
      const m = user.members.map(member => member)
      setMembersForUser(m)
    }
  }, [])



  const handleInputChange = (input: string) => {
    setQuery(input);
    if (input) {
      let filteredItems = membersForUser.filter(item => item.name.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(filteredItems);
        
    } else {
      getMemberNameValue("")
      setSuggestions([]);
    }
  };

  
  
  
  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    getMemberNameValue(suggestion)
    setSuggestions([]);
  };

  return <>
    <Input
          autoCorrect={false}
          placeholder={placeholder}
          value={query}
          onChangeText={handleInputChange}
          textStyle={{ fontSize: isTablet ? 30 : 16, paddingVertical: isTablet ? 8 : 0, color: "black", fontWeight: 300 }}
          style={[styles.input, {paddingVertical: isTablet ? 15 : 5, width: isTablet ? "80%" : "100%",}]}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSuggestionPress(item.name)}>
                <Text style={[styles.suggestion, {fontSize: isTablet ? 30 : 18, }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={[styles.suggestionsList, {width: isTablet ? "80%" : "100%", height: isTablet ? 400 : 200, }]}
          />
        )}
  
  </>
};

export default InputWithAutocomplete

const styles = StyleSheet.create({
  input: {
           
        backgroundColor: "#EDF2FA",
        borderWidth: 1,
        borderColor: theme['gradient-to'],
        borderRadius: 30,
        color: "white",
  },
  suggestionsList: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    
    color: theme.secondary,
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ffffff",
    backgroundColor: theme['gradient-to'],
    color: theme.secondary,

  },
  
})
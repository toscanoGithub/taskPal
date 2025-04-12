import React, { useCallback, useEffect, useState } from 'react';
import { Input, Text } from '@ui-kitten/components';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserContext } from '@/contexts/UserContext';
import theme from "../../theme.json"
import { FamilyMember } from '@/types/Entity';

interface InputWithAutocompleteProps {
  getMemberNameValue: (name: string) => void;
  placeholder: string;
}

const InputWithAutocomplete: React.FC<InputWithAutocompleteProps> = ({getMemberNameValue, placeholder}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FamilyMember[]>([]);
  const {user} = useUserContext()
  const [membersForUser, setMembersForUser] = useState<FamilyMember[]>([])
  
  useEffect(() => {
    if(user?.members) {
      const m = user.members.map(member => member)
      setMembersForUser(m)
    }
  }, [])



  const handleInputChange = (input: string) => {
    setQuery(input);
    if (input) {
      const filteredItems = membersForUser.filter(item => item.name.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredItems);
    } else {
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
          placeholder={placeholder}
          value={query}
          onChangeText={handleInputChange}
          style={styles.input}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSuggestionPress(item.name)}>
                <Text style={styles.suggestion}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}
  
  </>
};

export default InputWithAutocomplete

const styles = StyleSheet.create({
  input: {
    width:"100%",
        paddingTop: 5,
        marginBottom: 15,
        
        backgroundColor: "#EDF2FA",
        borderWidth: 1,
        borderColor: theme['gradient-to'],
        borderRadius: 30,
        color: "white",
  },
  suggestionsList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme["gradient-to"],
    backgroundColor: "white"
  },
  
})
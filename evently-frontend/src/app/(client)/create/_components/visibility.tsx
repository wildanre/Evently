import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe, Lock } from "lucide-react"

const VisibilitySelect = () => {
  const options = {
    public: {
      icon: Globe,
      label: 'Public',
      description: 'Anyone can see this event'
    },
    private: {
      icon: Lock,
      label: 'Private',
      description: 'Only invited people can see this event'
    }
  }

  return (
    <Select defaultValue="public">
      <SelectTrigger className="w-[140px] bg-[#1a1a2e]">
        <SelectValue placeholder="Select visibility" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([key, { icon: Icon, label }]) => (
          <SelectItem 
            key={key} 
            value={key}
            className="cursor-pointer"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </div>
              <span className="text-sm text-gray-500 ml-6">{}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default VisibilitySelect